import lodash from "lodash"
import chromeP from "webext-polyfill-kinda"

import type { IExtensionManager } from ".../types/global"
import logger from ".../utils/logger"
import ConvertRuleToV2 from "./RuleConverter"
import processRule from "./processor"

export class RuleHandler {
  /**
   *
   */
  constructor() {
    this.debounceDo = lodash.debounce(this.do, 20)
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

  onCurrentScenesChanged(activeSceneIds: string[]) {
    // Copy message data so later mutations in a sender cannot affect cached rule state.
    this.#activeSceneIds = [...activeSceneIds]
    this.invokeDebounceDo()
  }

  onCurrentUrlChanged(tabInfo: chrome.tabs.Tab) {
    this.#currentTabInfo = tabInfo
    this.invokeDebounceDo()
  }

  onTabClosed(_tabId: number, _removeInfo: unknown) {
    this.invokeDebounceDo()
  }

  onWindowClosed(_windowsId: number) {
    this.invokeDebounceDo()
  }

  setRules(rules: unknown[]) {
    if (!rules || rules.length === 0) {
      return
    }
    this._rules = this.convertRule(rules)
    this.invokeDebounceDo()
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
    this.debounceDo()
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

  private async invokeDebounceDo() {
    this.debounceDo()
  }

  private debounceDo

  private async do() {
    logger().debug("[Extension Manager] 执行规则")

    const self = await chromeP.management.getSelf()
    const tabs = await chromeP.tabs.query({})

    const ctx = {
      self,
      tabs,
      tab: this.#currentTabInfo ?? null,
      EM: this.EM
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
