import chromeP from "webext-polyfill-kinda"

import { storage } from ".../storage/sync"
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
  const options = await storage.options.getAll()

  // Use the scene storage facade so stale IDs from scenes deleted by older versions are removed.
  const activeSceneIds = await storage.scene.getActiveIds()

  const tabs = await chromeP.tabs.query({
    active: true,
    lastFocusedWindow: true
  })
  const tab = tabs ? tabs[0] : undefined

  handler.init(activeSceneIds, tab, options.ruleConfig, options.groups, EM)

  return {
    handler
  }
}

export default createRule
