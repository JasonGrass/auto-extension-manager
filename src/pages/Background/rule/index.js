import chromeP from "webext-polyfill-kinda"

import { SyncOptionsStorage } from ".../storage"
import { onTabClosed, onTabUrlChange, onWindowClosed } from "../event/tabChangeEvent"
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
  const options = await SyncOptionsStorage.getAll()

  const activeSceneId = await EM.LocalOptions.getActiveSceneId()

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

  return {
    handler
  }
}

export default createRule
