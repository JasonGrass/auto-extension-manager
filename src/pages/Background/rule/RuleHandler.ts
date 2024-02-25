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
   * 本地打开的情景模式
   */
  #currentScene?: config.IScene

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

  onCurrentSceneChanged(scene: config.IScene) {
    this.#currentScene = scene
    this.invokeDebounceDo()
  }

  onCurrentUrlChanged(tabInfo: chrome.tabs.Tab) {
    this.#currentTabInfo = tabInfo
    this.invokeDebounceDo()
  }

  onTabClosed(tabId: number, removeInfo: any) {
    this.invokeDebounceDo()
  }

  onWindowClosed(windowsId: number) {
    this.invokeDebounceDo()
  }

  setRules(rules: any[]) {
    if (!rules || rules.length === 0) {
      return
    }
    this._rules = this.convertRule(rules)
    this.invokeDebounceDo()
  }

  init(
    scene: config.IScene,
    tabInfo: chrome.tabs.Tab | undefined,
    rules: any[],
    groups: config.IGroup[],
    EM: IExtensionManager
  ) {
    this.#currentScene = scene
    this.#currentTabInfo = tabInfo
    this._rules = this.convertRule(rules)
    this.#groups = groups
    this.EM = EM
    this.debounceDo()
  }

  private convertRule(rules: any[]): ruleV2.IRuleConfig[] {
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
      scene: this.#currentScene,
      rules: this._rules,
      groups: this.#groups,
      ctx: ctx
    })
  }
}

// use singleton pattern to create a rule handler
const createRuleHandler: () => RuleHandler = (function () {
  let instance: any = null
  return function () {
    if (!instance) {
      instance = new RuleHandler()
    }
    return instance
  }
})()

export default createRuleHandler
