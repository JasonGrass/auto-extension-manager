import chromeP from "webext-polyfill-kinda"

import { storage } from ".../storage/sync"
import { resolveActiveSceneIds } from ".../storage/sync/SceneOptions"
import {
  getTabNavigation,
  onCurrentTabChanging,
  onTabClosed,
  onTabUrlChange,
  onWindowClosed
} from "../event/tabChangeEvent"
import createRuleHandler from "./RuleHandler"
import { traceRule } from "./ruleTrace"

/*
 * 创建规则执行，无其它依赖
 */
const createRule = async (EM) => {
  traceRule(undefined, "initialization.started")
  // 规则处理的单例对象
  const handler = createRuleHandler()

  // 浏览器事件监听。先绑定，避免异步读取配置时丢失导航事件。
  onCurrentTabChanging(handler.onCurrentTabChanging.bind(handler))
  onTabUrlChange(handler.onCurrentUrlChanged.bind(handler))
  onTabClosed(handler.onTabClosed.bind(handler))
  onWindowClosed(handler.onWindowClosed.bind(handler))

  // 初始化
  const [options, storedActiveSceneIds, tabs] = await Promise.all([
    storage.options.getAll(),
    EM.LocalOptions.getActiveSceneIds(),
    chromeP.tabs.query({
      active: true,
      lastFocusedWindow: true
    })
  ])
  const activeSceneIds = await resolveActiveSceneIds(
    storedActiveSceneIds,
    options.scenes,
    EM.LocalOptions
  )
  const queriedTab = tabs ? tabs[0] : undefined
  traceRule(undefined, "initialization.snapshot", {
    tabId: queriedTab?.id,
    committedUrl: queriedTab?.url,
    pendingUrl: queriedTab?.pendingUrl ?? null,
    ruleCount: options.ruleConfig?.length
  })

  // Prefer a newer tab captured while storage was loading over the parallel query snapshot.
  const currentTab = onTabUrlChange(handler.onCurrentUrlChanged.bind(handler), queriedTab)
  handler.init(
    activeSceneIds,
    currentTab,
    options.ruleConfig,
    options.groups,
    EM,
    getTabNavigation(currentTab?.id)
  )

  return {
    handler
  }
}

export default createRule
