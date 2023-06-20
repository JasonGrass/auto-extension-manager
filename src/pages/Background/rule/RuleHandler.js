/*
tabInfo
{
    "url": "http://blog.haoji.me/chrome-plugin-develop.html#hu-xiang-tong-xin-gai-lan",
    "title": "【干货】Chrome插件(扩展)开发全攻略-好记的博客",
    "windowId": 976470013,
    "id": 976470225
}
*/

class RuleHandler {
  #currentTabInfo

  constructor() {
    this.#currentTabInfo = null
  }

  onCurrentSceneChanged(scene) {
    console.log("RuleHandler", scene)
  }

  onCurrentUrlChanged(tabInfo) {
    this.#currentTabInfo = tabInfo

    console.log("RuleHandler", tabInfo)
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
