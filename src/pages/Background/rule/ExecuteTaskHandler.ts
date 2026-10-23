import chromeP from "webext-polyfill-kinda"
import { DelayCloseToken, getDelayCloser } from "./delayCloser"
import { ReloadCoordinator, type ReloadDecision } from "./ReloadCoordinator"
import type { RunningProcessContext } from "./processor"
import { traceRule } from "./ruleTrace"

export type ExecuteTask = {
  executeType?: "enable" | "disable"
  targetExtensions: string[]
  reload: boolean | undefined
  tabInfo: chrome.tabs.Tab | null
  ctx: RunningProcessContext
  priority: ExecuteTaskPriority
}
export class ExecuteTaskPriority {
  private _priority = 0
  get priority() {
    return this._priority
  }
  setNotMatch() {
    this._priority -= 100
  }
}

function decision(task: ExecuteTask, extensionId: string): ReloadDecision {
  return {
    extensionId,
    enabled: task.executeType === "enable",
    ruleId: task.ctx.rule?.id ?? "",
    reload: Boolean(task.reload)
  }
}
function record(task: ExecuteTask, info: chrome.management.ExtensionInfo) {
  traceRule(task.ctx, "history.started", { extensionId: info.id, action: task.executeType })
  void Promise.resolve()
    .then(() => {
      const handler = task.ctx.EM?.History.EventHandler
      return task.executeType === "enable"
        ? handler?.onAutoEnabled(info, task.ctx.rule!, task.ctx.matchResult!)
        : handler?.onAutoDisabled(info, task.ctx.rule!, task.ctx.matchResult!)
    })
    .then(() =>
      traceRule(task.ctx, "history.completed", { extensionId: info.id, action: task.executeType })
    )
    .catch((error) => {
      traceRule(task.ctx, "history.failed", { extensionId: info.id, error: String(error) })
      console.warn("Automatic rule history failed", error)
    })
}

let fallbackReloads: ReloadCoordinator | undefined
export class ExecuteTaskHandler {
  private tasks: ExecuteTask[] = []
  private taskMap = new Map<string, ExecuteTask>()
  close(task: ExecuteTask) {
    task.executeType = "disable"
    this.addTask(task)
  }
  open(task: ExecuteTask) {
    task.executeType = "enable"
    this.addTask(task)
  }
  private addTask(task: ExecuteTask) {
    for (const id of task.targetExtensions) {
      const previous = this.taskMap.get(id)
      traceRule(task.ctx, "task.resolved", {
        extensionId: id,
        action: task.executeType,
        priority: task.priority.priority,
        previousRuleId: previous?.ctx.rule?.id,
        previousPriority: previous?.priority.priority,
        winnerRuleId:
          !previous || previous.priority.priority < task.priority.priority
            ? task.ctx.rule?.id
            : previous.ctx.rule?.id,
        reload: Boolean(task.reload)
      })
      if (!previous) this.taskMap.set(id, task)
      else if (previous.priority.priority < task.priority.priority) {
        previous.targetExtensions = previous.targetExtensions.filter((extId) => extId !== id)
        this.taskMap.set(id, task)
      } else task.targetExtensions = task.targetExtensions.filter((extId) => extId !== id)
    }
    this.tasks.push(task)
  }

  async execute(context?: RunningProcessContext | import("./processor").ProcessContext) {
    const ctx = context ?? this.tasks[0]?.ctx
    if (!ctx) return
    traceRule(ctx, "execution.started", {
      decisions: [...this.taskMap].map(([id, task]) => decision(task, id))
    })
    const reloads = ctx.reloads ?? (fallbackReloads ??= new ReloadCoordinator())
    await reloads.begin(
      ctx,
      [...this.taskMap].map(([id, task]) => decision(task, id))
    )
    const completions: Promise<void>[] = []
    const isPending = () => ctx.phase === "pending"
    const tokens: import("./delayCloser").DelayCloseToken[] = []
    for (const task of this.tasks) {
      if (ctx.isCurrent?.() === false) {
        traceRule(ctx, "execution.stale", { at: "before-task" })
        break
      }
      if (isPending() && task.executeType === "disable") {
        traceRule(task.ctx, "operation.skipped", {
          action: "disable",
          reason: "pending-enable-only",
          extensionIds: [...task.targetExtensions]
        })
        continue
      }
      for (const id of task.targetExtensions) {
        if (ctx.isCurrent?.() === false) break
        const next = decision(task, id)
        let prepared: Awaited<ReturnType<ReloadCoordinator["prepare"]>>
        try {
          const closer = getDelayCloser()
          if (next.enabled) closer.cancel(id)
          traceRule(task.ctx, "extension.state.started", {
            extensionId: id,
            expectedEnabled: next.enabled
          })
          if (ctx.apiCounts) ctx.apiCounts.managementGet++
          const info = await chromeP.management.get(id)
          traceRule(task.ctx, "extension.state.completed", {
            extensionId: id,
            enabled: info?.enabled,
            stale: ctx.isCurrent?.() === false
          })
          if (ctx.isCurrent?.() === false) break
          if (!info) continue
          if (info.enabled === next.enabled) {
            traceRule(task.ctx, "operation.skipped", {
              extensionId: id,
              reason: "already-in-desired-state",
              expectedEnabled: next.enabled
            })
            await reloads.confirmExisting(ctx, next)
            continue
          }
          if (next.enabled) {
            prepared = await reloads.prepare(ctx, next)
            if (ctx.isCurrent?.() === false) {
              await reloads.complete(prepared, false)
              break
            }
            const started = performance.now()
            traceRule(task.ctx, "operation.enable.started", { extensionId: id })
            if (ctx.apiCounts) ctx.apiCounts.managementSetEnabled++
            await chromeP.management.setEnabled(id, true)
            record(task, info)
            await reloads.complete(prepared, true)
            traceRule(task.ctx, "operation.enable.completed", {
              extensionId: id,
              stale: ctx.isCurrent?.() === false,
              ms: performance.now() - started
            })
          } else {
            const tabs = await (ctx.getTabs?.() ?? Promise.resolve(ctx.tabs ?? []))
            if (ctx.isCurrent?.() === false) break
            if (isPending()) {
              traceRule(task.ctx, "operation.skipped", {
                extensionId: id,
                action: "disable",
                reason: "pending-discovered-by-query"
              })
              continue
            }
            if (tabs.some((tab) => tab.url?.includes(`/${id}/`))) {
              closer.cancel(id)
              traceRule(task.ctx, "operation.skipped", {
                extensionId: id,
                action: "disable",
                reason: "extension-page-open"
              })
              continue
            }
            const token = closer.close(
              info,
              () => {
                record(task, info)
                if (ctx.isCurrent?.() === false) ctx.requestEvaluation?.()
              },
              ctx.isCurrent,
              async () => {
                prepared = await reloads.prepare(ctx, next)
              },
              task.ctx
            )
            traceRule(task.ctx, "operation.disable.queued", {
              extensionId: id,
              delayMs: DelayCloseToken.DelayTime
            })
            tokens.push(token)
            completions.push(
              token.done.then(async (result) => {
                traceRule(task.ctx, "operation.disable.completed", {
                  extensionId: id,
                  result,
                  available: token.Available,
                  stale: ctx.isCurrent?.() === false
                })
                if (result !== "cancelled" && ctx.apiCounts) ctx.apiCounts.managementSetEnabled++
                await reloads.complete(prepared, result === "disabled" && token.Available)
              })
            )
          }
        } catch (error) {
          traceRule(task.ctx, "operation.failed", {
            extensionId: id,
            action: task.executeType,
            error: String(error)
          })
          await reloads.complete(prepared, false)
          console.warn("Rule extension operation failed", id, error)
        }
      }
    }
    const finish = async () => {
      if (completions.length)
        traceRule(ctx, "execution.waiting-delayed", { operationCount: completions.length })
      await Promise.all(completions)
      await reloads.flush(ctx)
      for (const token of tokens) getDelayCloser().release(token)
      traceRule(ctx, "execution.completed", {
        stale: ctx.isCurrent?.() === false,
        ...ctx.apiCounts
      })
    }
    // Waiting for delayed disables here would block the latest-task runner for a second.
    if (completions.length)
      void finish().catch((error) => console.warn("Rule reload batch failed", error))
    else await finish()
  }
}
