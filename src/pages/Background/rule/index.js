import chromeP from "webext-polyfill-kinda"

import { LocalOptionsStorage, SyncOptionsStorage } from ".../storage"
import { onTabClosed, onTabUrlChange, onWindowClosed } from "../event/tabChangeEvent"
import { createRuleMessage } from "../message"
import createRuleHandler from "./RuleHandler"

/*
 * 创建规则执行，无其它依赖
 */
const createRule = async (EM) => {
  // 规则处理的单例对象
  const handler = createRuleHandler()

  // 浏览器事件监听
  onTabUrlChange(handler.onCurrentUrlChanged.bind(handler))
  onTabClosed(handler.onTabClosed.bind(handler))
  onWindowClosed(handler.onWindowClosed.bind(handler))

  // 初始化
  const local = await LocalOptionsStorage.getAll()
  const options = await SyncOptionsStorage.getAll()

  const activeSceneId = local.scene?.activeId ?? ""

  const tabs = await chromeP.tabs.query({
    active: true,
    lastFocusedWindow: true
  })
  const tab = tabs ? tabs[0] : undefined

  handler.init(
    {
      id: activeSceneId
    },
    tab,
    options.ruleConfig,
    options.groups,
    EM
  )

  // 初始化规则相关的事件监听
  createRuleMessage(handler)

  return {
    handler
  }
}

export default createRule
