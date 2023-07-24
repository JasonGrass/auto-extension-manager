import processRule from "./processor"


class RuleHandler {
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
  #rules?: rule.IRuleConfig[]

  /**
   * 分组配置信息
   */
  #groups?: config.IGroup[]

  onCurrentSceneChanged(scene: config.IScene) {
    this.#currentScene = scene
    this.#do()
  }

  onCurrentUrlChanged(tabInfo: chrome.tabs.Tab) {
    this.#currentTabInfo = tabInfo
    this.#do()
  }

  onTabClosed(tabId: number, removeInfo: any) {
    this.#do()
  }

  setRules(rules: rule.IRuleConfig[]) {
    this.#rules = rules
    this.#do()
  }

  init(scene: config.IScene, tabInfo: chrome.tabs.Tab, rules: rule.IRuleConfig[], groups: config.IGroup[]) {
    this.#currentScene = scene
    this.#currentTabInfo = tabInfo
    this.#rules = rules
    this.#groups = groups
    this.#do()
  }

  #do() {
    processRule({
      scene: this.#currentScene,
      tabInfo: this.#currentTabInfo,
      rules: this.#rules,
      groups: this.#groups
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
