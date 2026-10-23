import chromeP from "webext-polyfill-kinda"

import storage from ".../storage/sync"
import { resolveActiveSceneIds } from ".../storage/sync/SceneOptions"
import type { IExtensionManager } from ".../types/global"
import ConvertRuleToV2 from "./RuleConverter"
import { getDelayCloser } from "./delayCloser"
import { createLatestTaskRunner } from "./latestTaskRunner"
import processRule, { type ProcessContext } from "./processor"
import { ReloadCoordinator } from "./ReloadCoordinator"
import { describeRuleTab, traceRule, type RuleTrace } from "./ruleTrace"

export type TabNavigationChange = {
  tab: chrome.tabs.Tab
  navigationId: string
  phase: "pending" | "committed"
  cancelled?: boolean
}

export class RuleHandler {
  /**
   *
   */
  constructor() {
    this.runLatest = createLatestTaskRunner(async () => {
      try {
        await this.do()
      } catch (error) {
        console.error("[规则执行失败]", error)
      }
    })
  }

  /**
   * 当前标签信息
   */
  #currentTabInfo?: chrome.tabs.Tab

  /**
   * 本地激活的情景模式 ID 集合
   */
  #activeSceneIds: string[] = []

  /**
   * 所有的规则数据，缓存起来，是避免每次执行规则时，都需要从 storage 中获取一遍
   */
  private _rules?: ruleV2.IRuleConfig[]

  /**
   * 分组配置信息
   */
  #groups?: config.IGroup[]

  /**
   * 全局对象
   */
  private EM?: IExtensionManager

  private configRevision = 0
  private stateRevision = 0
  private evaluationSequence = 0
  private currentTabReady = true
  private reloads = new ReloadCoordinator()
  private navigation = new Map<number, TabNavigationChange>()
  private configReady = true
  private refreshing: Promise<void> = Promise.resolve()

  onCurrentTabChanging() {
    traceRule(undefined, "state.invalidated", {
      reason: "focus-changing",
      stateRevision: this.stateRevision + 1
    })
    this.currentTabReady = false
    this.stateRevision++
    void this.reloads.clear()
  }

  onCurrentScenesChanged(activeSceneIds: string[]) {
    traceRule(undefined, "event.scenes", {
      activeSceneIds: [...activeSceneIds],
      stateRevision: this.stateRevision + 1
    })
    // Copy message data so later mutations in a sender cannot affect cached rule state.
    this.#activeSceneIds = [...activeSceneIds]
    this.stateRevision++
    this.invokeDo()
  }

  onCurrentUrlChanged(tabInfo?: chrome.tabs.Tab, change?: TabNavigationChange) {
    traceRule(undefined, "event.navigation", {
      changedTabId: change?.tab.id,
      focusedTabId: tabInfo?.id ?? this.#currentTabInfo?.id,
      navigationId: change?.navigationId,
      committedUrl: change?.tab.url ?? tabInfo?.url,
      pendingUrl: change?.tab.pendingUrl ?? tabInfo?.pendingUrl ?? null,
      phase: change?.phase ?? "committed",
      cancelled: Boolean(change?.cancelled),
      stateRevision: this.stateRevision + 1
    })
    if (tabInfo) {
      this.currentTabReady = true
      this.#currentTabInfo = { ...tabInfo }
    }
    if (change?.tab.id !== undefined) {
      this.navigation.set(change.tab.id, { ...change, tab: { ...change.tab } })
      if (change.cancelled) void this.reloads.cancelTab(change.tab.id)
    }
    this.stateRevision++
    this.invokeDo()
  }

  onTabClosed(_tabId: number, _removeInfo: unknown) {
    traceRule(undefined, "event.tab-closed", { tabId: _tabId })
    this.navigation.delete(_tabId)
    void this.reloads.cancelTab(_tabId)
    if (this.#currentTabInfo?.id === _tabId) this.#currentTabInfo = undefined
    this.stateRevision++
    this.invokeDo()
  }

  onWindowClosed(_windowsId: number) {
    traceRule(undefined, "event.window-closed", { windowId: _windowsId })
    if (this.#currentTabInfo?.windowId === _windowsId) this.#currentTabInfo = undefined
    for (const [id, change] of this.navigation) {
      if (change.tab.windowId === _windowsId) {
        this.navigation.delete(id)
        void this.reloads.cancelTab(id)
      }
    }
    this.stateRevision++
    this.invokeDo()
  }

  setRules(rules: unknown[]) {
    this.invalidateConfig()
    this._rules = this.convertRule(rules)
    this.configReady = true
    this.invokeDo()
  }

  private invalidateConfig() {
    traceRule(undefined, "config.invalidated", { configRevision: this.configRevision + 1 })
    this.configRevision++
    this.configReady = false
    getDelayCloser().cancelAll()
    void this.reloads.clear()
    return this.configRevision
  }

  refreshConfig(): Promise<void> {
    const revision = this.invalidateConfig()
    const refresh = async () => {
      const options = await storage.options.getAll()
      if (revision !== this.configRevision) return

      const activeSceneIds = await resolveActiveSceneIds(
        this.#activeSceneIds,
        options.scenes,
        this.EM!.LocalOptions
      )
      if (revision !== this.configRevision) return

      this._rules = this.convertRule(options.ruleConfig)
      this.#groups = options.groups
      this.#activeSceneIds = activeSceneIds
      this.configReady = true
      traceRule(undefined, "config.applied", {
        configRevision: revision,
        ruleCount: this._rules.length,
        groupCount: this.#groups?.length
      })
      this.invokeDo()
    }
    this.refreshing = refresh()
    const current = this.refreshing
    return current.then(async () => {
      // A superseded request acknowledges only after the newest snapshot is applied.
      if (revision !== this.configRevision) await this.refreshing
    })
  }

  init(
    activeSceneIds: string[],
    tabInfo: chrome.tabs.Tab | undefined,
    rules: unknown[],
    groups: config.IGroup[],
    EM: IExtensionManager,
    navigation?: TabNavigationChange
  ) {
    this.#activeSceneIds = [...activeSceneIds]
    this.#currentTabInfo = tabInfo ? { ...tabInfo } : undefined
    if (navigation?.tab.id !== undefined) this.navigation.set(navigation.tab.id, navigation)
    this._rules = this.convertRule(rules)
    this.#groups = groups
    this.EM = EM
    this.initialized = true
    traceRule(undefined, "initialization.completed", {
      ruleCount: this._rules.length,
      tabId: tabInfo?.id,
      pendingUrl: tabInfo?.pendingUrl ?? null,
      committedUrl: tabInfo?.url
    })
    this.invokeDo()
  }

  private convertRule(rules: unknown[]): ruleV2.IRuleConfig[] {
    if (!rules || rules.length === 0) {
      return []
    }

    const ruleList = rules
      .map((r) => ConvertRuleToV2(r as rule.IRuleConfig))
      .filter((r) => r) as ruleV2.IRuleConfig[]
    return ruleList
  }

  private invokeDo() {
    if (this.initialized) {
      this.runLatest()
    }
  }

  private initialized = false

  private runLatest: () => void

  private async do() {
    const revision = this.configRevision
    const state = this.stateRevision
    const isCurrent = () =>
      this.configReady &&
      this.currentTabReady &&
      revision === this.configRevision &&
      state === this.stateRevision
    if (!isCurrent()) {
      traceRule(undefined, "evaluation.skipped", {
        reason: !this.configReady ? "config-not-ready" : "focus-not-ready",
        configRevision: revision,
        stateRevision: state
      })
      return
    }

    const started = performance.now()
    const navigation = new Map(this.navigation)
    const current = this.#currentTabInfo
    // Derive the phase from outstanding navigation, not from the last arriving event.
    let phase: "pending" | "committed" =
      current?.pendingUrl || [...navigation.values()].some((change) => change.tab.pendingUrl)
        ? "pending"
        : "committed"
    const trace: RuleTrace = {
      id: `${Date.now().toString(36)}:${++this.evaluationSequence}`,
      startedAt: started,
      configRevision: revision,
      stateRevision: state,
      phase,
      urls: new WeakMap()
    }
    const project = (tab: chrome.tabs.Tab) => {
      const observed = tab.id === undefined ? undefined : navigation.get(tab.id)?.tab
      const pendingUrl =
        tab.pendingUrl ?? (observed?.url === tab.url ? observed?.pendingUrl : undefined)
      const projected = phase === "pending" && pendingUrl ? { ...tab, url: pendingUrl } : tab
      trace.urls.set(projected, {
        tabId: tab.id,
        windowId: tab.windowId,
        navigationId: tab.id === undefined ? undefined : navigation.get(tab.id)?.navigationId,
        urlSource: phase === "pending" && pendingUrl ? "pendingUrl" : "url",
        committedUrl: tab.url ?? null,
        pendingUrl: pendingUrl ?? null,
        matchUrl: (phase === "pending" && pendingUrl ? pendingUrl : tab.url) ?? null
      })
      return projected
    }
    let tabs: Promise<chrome.tabs.Tab[]> | undefined
    let queries = 0
    const getTabs = () =>
      (tabs ??=
        (queries++,
        traceRule(ctx, "tabs.query.started"),
        chromeP.tabs
          .query({})
          .then((items) => {
            if (items.some((tab) => tab.pendingUrl)) phase = ctx.phase = trace.phase = "pending"
            const projected = items.map(project)
            traceRule(ctx, "tabs.query.completed", {
              tabCount: items.length,
              urls: projected.map((tab) => describeRuleTab(ctx, tab))
            })
            return projected
          })
          .catch((error) => {
            traceRule(ctx, "tabs.query.failed", { error: String(error) })
            throw error
          })))

    const ctx: ProcessContext = {
      selfId: chrome.runtime.id,
      trace,
      getTabs,
      tab: current ? project(current) : null,
      EM: this.EM,
      isCurrent,
      reloads: this.reloads,
      requestEvaluation: () => {
        traceRule(ctx, "evaluation.reconcile-requested", { reason: "stale-operation-completed" })
        this.stateRevision++
        this.invokeDo()
      },
      apiCounts: { managementGet: 0, managementSetEnabled: 0 },
      phase,
      navigationId:
        current?.id === undefined ? undefined : navigation.get(current.id)?.navigationId,
      configKey: JSON.stringify([this._rules, this.#groups, this.#activeSceneIds])
    }

    traceRule(ctx, "evaluation.started", {
      ruleCount: this._rules?.length ?? 0,
      activeSceneIds: [...this.#activeSceneIds]
    })

    await processRule({
      activeSceneIds: this.#activeSceneIds,
      rules: this._rules,
      groups: this.#groups,
      ctx: ctx
    })
    traceRule(ctx, "evaluation.completed", {
      stale: !isCurrent(),
      ms: performance.now() - started,
      tabQueries: queries,
      ...ctx.apiCounts
    })
  }
}

// use singleton pattern to create a rule handler
const createRuleHandler: () => RuleHandler = (function () {
  let instance: RuleHandler | null = null
  return function () {
    if (!instance) {
      instance = new RuleHandler()
    }
    return instance
  }
})()

export default createRuleHandler
