import chromeP from "webext-polyfill-kinda"

import storage from ".../storage/sync"
import { resolveActiveSceneIds } from ".../storage/sync/SceneOptions"
import type { IExtensionManager } from ".../types/global"
import logger from ".../utils/logger"
import ConvertRuleToV2 from "./RuleConverter"
import { getDelayCloser } from "./delayCloser"
import { createLatestTaskRunner } from "./latestTaskRunner"
import processRule from "./processor"

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
  private configReady = true
  private refreshing: Promise<void> = Promise.resolve()

  onCurrentScenesChanged(activeSceneIds: string[]) {
    // Copy message data so later mutations in a sender cannot affect cached rule state.
    this.#activeSceneIds = [...activeSceneIds]
    this.invokeDo()
  }

  onCurrentUrlChanged(tabInfo?: chrome.tabs.Tab) {
    if (tabInfo) {
      this.#currentTabInfo = tabInfo
    }
    this.invokeDo()
  }

  onTabClosed(_tabId: number, _removeInfo: unknown) {
    this.invokeDo()
  }

  onWindowClosed(_windowsId: number) {
    this.invokeDo()
  }

  setRules(rules: unknown[]) {
    this.invalidateConfig()
    this._rules = this.convertRule(rules)
    this.configReady = true
    this.invokeDo()
  }

  private invalidateConfig() {
    this.configRevision++
    this.configReady = false
    getDelayCloser().cancelAll()
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
    EM: IExtensionManager
  ) {
    this.#activeSceneIds = [...activeSceneIds]
    this.#currentTabInfo = tabInfo
    this._rules = this.convertRule(rules)
    this.#groups = groups
    this.EM = EM
    this.initialized = true
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
    const isCurrent = () => this.configReady && revision === this.configRevision
    if (!isCurrent()) return
    logger().debug("[Extension Manager] 执行规则")

    const tabs = await chromeP.tabs.query({})
    if (!isCurrent()) return

    const ctx = {
      selfId: chrome.runtime.id,
      tabs,
      tab: this.#currentTabInfo ?? null,
      EM: this.EM,
      isCurrent
    }

    logger().debug(`[Rule] ctx`, ctx)

    await processRule({
      activeSceneIds: this.#activeSceneIds,
      rules: this._rules,
      groups: this.#groups,
      ctx: ctx
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
