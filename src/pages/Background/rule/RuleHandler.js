/*
tabInfo
{
    "url": "http://blog.haoji.me/chrome-plugin-develop.html#hu-xiang-tong-xin-gai-lan",
    "title": "【干货】Chrome插件(扩展)开发全攻略-好记的博客",
    "windowId": 976470013,
    "id": 976470225
}
scene{
  id:"xxx"
}
*/
import precessRule from "./processor"

class RuleHandler {
  /**
   * 当前标签信息
   */
  #currentTabInfo

  /**
   * 本地打开的情景模式
   */
  #currentScene

  /**
   * 所有的规则数据，缓存起来，是避免每次执行规则时，都需要从 storage 中获取一遍
   */
  #rules

  /**
   * 分组配置信息
   */
  #groups

  onCurrentSceneChanged(scene) {
    this.#currentScene = scene
    this.#do()
  }

  onCurrentUrlChanged(tabInfo) {
    this.#currentTabInfo = tabInfo
    this.#do()
  }

  setRules(rules) {
    this.#rules = rules
    this.#do()
  }

  init(scene, tabInfo, rules, groups) {
    this.#currentScene = scene
    this.#currentTabInfo = tabInfo
    this.#rules = rules
    this.#groups = groups
    this.#do()
  }

  #do() {
    precessRule({
      scene: this.#currentScene,
      tabInfo: this.#currentTabInfo,
      rules: this.#rules,
      groups: this.#groups
    })
  }
}

// use singleton pattern to create a rule handler
const createRuleHandler = (function () {
  let instance = null
  return function () {
    if (!instance) {
      instance = new RuleHandler()
    }
    return instance
  }
})()

export default createRuleHandler
