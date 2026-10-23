import type { ProcessContext } from "./processor"
import { traceRule } from "./ruleTrace"

const SESSION_KEY = "rulePendingReloads.v1"
export type ReloadDecision = {
  extensionId: string
  enabled: boolean
  ruleId: string
  reload: boolean
}
type Operation = Omit<ReloadDecision, "reload"> & { applied: boolean }
type Intent = {
  tabId: number
  windowId?: number
  url: string
  navigationId: string
  configKey: string
  dispatched: boolean
  operations: Operation[]
}
type Prepared = { intent: Intent; operation: Operation; ctx: ProcessContext }

/** Only reload intentions are journaled; rules and extension state remain authoritative. */
export class ReloadCoordinator {
  private intents = new Map<number, Intent>()
  private restored = new Set<number>()
  private writing: Promise<void> = Promise.resolve()
  readonly ready = this.restore()

  private async restore() {
    try {
      const data = (await chrome.storage.session.get(SESSION_KEY))[SESSION_KEY]
      traceRule(undefined, "reload.restore.read", {
        storageKey: SESSION_KEY,
        recordCount: Array.isArray(data) ? data.length : 0
      })
      if (!Array.isArray(data)) return
      for (const item of data) {
        if (
          !item ||
          !Number.isInteger(item.tabId) ||
          typeof item.url !== "string" ||
          typeof item.configKey !== "string" ||
          typeof item.navigationId !== "string" ||
          item.dispatched !== false ||
          !Array.isArray(item.operations)
        ) {
          traceRule(undefined, "reload.restore.skipped", {
            tabId: item?.tabId,
            navigationId: item?.navigationId,
            reason: item?.dispatched ? "already-dispatched" : "invalid-record"
          })
          continue
        }
        const operations = item.operations.filter(
          (op: Operation) =>
            op &&
            typeof op.extensionId === "string" &&
            typeof op.ruleId === "string" &&
            typeof op.enabled === "boolean" &&
            typeof op.applied === "boolean"
        )
        if (!operations.length) {
          traceRule(undefined, "reload.restore.skipped", {
            tabId: item.tabId,
            reason: "no-valid-operations"
          })
          continue
        }
        this.intents.set(item.tabId, { ...item, operations })
        this.restored.add(item.tabId)
        traceRule(undefined, "reload.restore.loaded", {
          tabId: item.tabId,
          navigationId: item.navigationId,
          targetUrl: item.url,
          operations: operations.map((op: Operation) => ({ ...op }))
        })
      }
    } catch (error) {
      console.warn("Read pending rule reloads failed", error)
      traceRule(undefined, "reload.restore.failed", { error: String(error) })
    }
  }

  private save() {
    const snapshot = structuredClone([...this.intents.values()])
    this.writing = this.writing.then(async () => {
      try {
        await chrome.storage.session.set({ [SESSION_KEY]: snapshot })
        traceRule(undefined, "reload.session.saved", {
          recordCount: snapshot.length,
          records: snapshot.map((intent) => ({
            tabId: intent.tabId,
            navigationId: intent.navigationId,
            targetUrl: intent.url,
            dispatched: intent.dispatched,
            operations: intent.operations.map((op) => ({ ...op }))
          }))
        })
      } catch (error) {
        console.warn("Save pending rule reloads failed", error)
        traceRule(undefined, "reload.session.failed", { error: String(error) })
      }
    })
    return this.writing
  }

  async clear() {
    await this.ready
    traceRule(undefined, "reload.cancel-all", { recordCount: this.intents.size })
    this.intents.clear()
    this.restored.clear()
    await this.save()
  }

  async cancelTab(tabId: number) {
    await this.ready
    traceRule(undefined, "reload.cancel-tab", {
      tabId,
      navigationId: this.intents.get(tabId)?.navigationId
    })
    this.intents.delete(tabId)
    this.restored.delete(tabId)
    await this.save()
  }

  async begin(ctx: ProcessContext, decisions: ReloadDecision[]) {
    await this.ready
    if (ctx.isCurrent?.() === false) return
    const tab = ctx.tab
    let changed = false
    for (const [tabId, intent] of this.intents) {
      const restored = this.restored.has(tabId)
      if (
        tabId !== tab?.id ||
        intent.dispatched ||
        intent.configKey !== (ctx.configKey ?? "") ||
        (restored ? intent.url !== tab.url : intent.navigationId !== (ctx.navigationId ?? tab.url))
      ) {
        traceRule(ctx, "reload.cancelled", {
          reason: "ownership-or-config-changed-or-dispatched",
          intentTabId: tabId,
          intentNavigationId: intent.navigationId,
          targetUrl: intent.url,
          restored,
          dispatched: intent.dispatched,
          configMatches: intent.configKey === (ctx.configKey ?? "")
        })
        this.intents.delete(tabId)
        changed = true
        continue
      }
      this.restored.delete(tabId)
      intent.navigationId = ctx.navigationId ?? tab.url ?? ""
      intent.url = tab.url ?? ""
      intent.operations = intent.operations.filter((op) =>
        decisions.some(
          (decision) =>
            decision.reload &&
            decision.extensionId === op.extensionId &&
            decision.enabled === op.enabled &&
            decision.ruleId === op.ruleId
        )
      )
      if (!intent.operations.length) this.intents.delete(tabId)
      traceRule(ctx, "reload.revalidated", {
        restored,
        operationCount: intent.operations.length,
        operations: intent.operations.map((op) => ({ ...op }))
      })
      changed = true
    }
    if (changed) await this.save()
  }

  async prepare(ctx: ProcessContext, decision: ReloadDecision): Promise<Prepared | undefined> {
    if (!decision.reload || ctx.tab?.id === undefined || !ctx.tab.url) {
      traceRule(ctx, "reload.skipped", {
        reason: !decision.reload ? "option-off" : "no-current-tab-url",
        extensionId: decision.extensionId
      })
      return
    }
    if (ctx.isCurrent?.() === false) {
      traceRule(ctx, "reload.skipped", { reason: "stale-before-prepare" })
      return
    }
    const tab = ctx.tab
    let intent = this.intents.get(tab.id!)
    if (!intent) {
      intent = {
        tabId: tab.id!,
        windowId: tab.windowId,
        url: tab.url!,
        navigationId: ctx.navigationId ?? tab.url!,
        configKey: ctx.configKey ?? "",
        dispatched: false,
        operations: []
      }
      this.intents.set(tab.id!, intent)
    }
    const operation = { ...decision, applied: false }
    intent.operations = intent.operations.filter((op) => op.extensionId !== decision.extensionId)
    intent.operations.push(operation)
    traceRule(ctx, "reload.prepared", { ...decision, operationCount: intent.operations.length })
    await this.save()
    return { intent, operation, ctx }
  }

  async complete(prepared: Prepared | undefined, succeeded: boolean) {
    if (!prepared || this.intents.get(prepared.intent.tabId) !== prepared.intent) return
    traceRule(prepared.ctx, "reload.operation-completed", {
      extensionId: prepared.operation.extensionId,
      succeeded
    })
    if (succeeded) prepared.operation.applied = true
    else
      prepared.intent.operations = prepared.intent.operations.filter(
        (op) => op !== prepared.operation
      )
    if (!prepared.intent.operations.length) this.intents.delete(prepared.intent.tabId)
    await this.save()
  }

  async confirmExisting(ctx: ProcessContext, decision: ReloadDecision) {
    const intent = ctx.tab?.id === undefined ? undefined : this.intents.get(ctx.tab.id)
    const operation = intent?.operations.find(
      (op) =>
        op.extensionId === decision.extensionId &&
        op.enabled === decision.enabled &&
        op.ruleId === decision.ruleId &&
        decision.reload
    )
    if (operation) {
      traceRule(ctx, "reload.existing-state-confirmed", {
        extensionId: decision.extensionId,
        expectedEnabled: decision.enabled
      })
      operation.applied = true
      await this.save()
    }
  }

  async flush(ctx: ProcessContext) {
    if (ctx.phase === "pending" || ctx.isCurrent?.() === false || ctx.tab?.id === undefined) {
      traceRule(ctx, "reload.deferred-or-skipped", {
        reason:
          ctx.isCurrent?.() === false
            ? "stale"
            : ctx.phase === "pending"
              ? "awaiting-commit"
              : "no-current-tab"
      })
      return
    }
    const intent = this.intents.get(ctx.tab.id)
    if (!intent || intent.dispatched || !intent.operations.some((op) => op.applied)) {
      traceRule(ctx, "reload.skipped", {
        reason: !intent
          ? "no-intent"
          : intent.dispatched
            ? "already-dispatched"
            : "no-successful-operation"
      })
      return
    }
    try {
      traceRule(ctx, "reload.tab-check.started", { targetUrl: intent.url })
      const tab = await chrome.tabs.get(intent.tabId)
      traceRule(ctx, "reload.tab-check.completed", {
        actualUrl: tab.url,
        actualPendingUrl: tab.pendingUrl ?? null,
        active: tab.active,
        actualWindowId: tab.windowId
      })
      if (ctx.isCurrent?.() === false || this.intents.get(intent.tabId) !== intent) {
        traceRule(ctx, "reload.skipped", { reason: "stale-after-tab-check" })
        return
      }
      if (tab.url !== intent.url || tab.active === false || tab.windowId !== intent.windowId) {
        traceRule(ctx, "reload.cancelled", {
          reason: "page-or-focus-changed",
          targetUrl: intent.url,
          actualUrl: tab.url,
          active: tab.active
        })
        this.intents.delete(intent.tabId)
        await this.save()
        return
      }
      if (tab.pendingUrl) {
        traceRule(ctx, "reload.deferred", {
          reason: "native-pending-url",
          pendingUrl: tab.pendingUrl
        })
        return
      }
      const actual = await Promise.all(
        intent.operations
          .filter((op) => op.applied)
          .map(async (op) => {
            try {
              if (ctx.apiCounts) ctx.apiCounts.managementGet++
              const info = await chrome.management.get(op.extensionId)
              traceRule(ctx, "reload.extension-checked", {
                extensionId: op.extensionId,
                expectedEnabled: op.enabled,
                actualEnabled: info.enabled
              })
              return info.enabled === op.enabled
            } catch (error) {
              traceRule(ctx, "reload.extension-check.failed", {
                extensionId: op.extensionId,
                error: String(error)
              })
              return false
            }
          })
      )
      if (ctx.isCurrent?.() === false || this.intents.get(intent.tabId) !== intent) {
        traceRule(ctx, "reload.skipped", { reason: "stale-after-extension-check" })
        return
      }
      if (!actual.some(Boolean)) {
        traceRule(ctx, "reload.cancelled", { reason: "no-expected-extension-state" })
        this.intents.delete(intent.tabId)
        await this.save()
        return
      }
      // Consume before dispatch: a restarted worker must not repeat an ambiguous reload.
      intent.dispatched = true
      traceRule(ctx, "reload.dispatch-marked", { targetUrl: intent.url })
      await this.save()
      if (ctx.isCurrent?.() === false) {
        traceRule(ctx, "reload.skipped", { reason: "stale-before-dispatch" })
        return
      }
      traceRule(ctx, "reload.dispatch.started", { targetUrl: intent.url })
      await chrome.tabs.reload(intent.tabId)
      traceRule(ctx, "reload.dispatched", { targetUrl: intent.url })
    } catch (error) {
      traceRule(ctx, "reload.failed", { error: String(error) })
      console.warn("Rule reload failed", error)
    }
  }
}
