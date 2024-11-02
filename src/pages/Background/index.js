import { LocalOptions } from ".../storage/local"
import logger from ".../utils/logger"
import { EventCache } from "./event/EventCache"
import createExtension from "./extension"
import createHistory from "./history"
import createMessageHandler from "./message/messageIndex.js"
import createRule from "./rule"

console.log(`[Extension Manager] Background Run. ${new Date().toLocaleString()}`)

// 日志初始化
logger().init()

// ExtensionManager 全局对象
const EM = {}

EM.EventCache = new EventCache()

// 因为此事件的时机非常早，需要提前订阅，如果没有在初始化的主流程中执行，而在放在了微任务或者宏任务队列中，可能无法被执行
// Fired when the extension is first installed, when the extension is updated to a new version, and when Chrome is updated to a new version.
chrome.runtime.onInstalled.addListener((info) => {
  EM.EventCache.add("onInstalled", info)
})

// initial running
;(async () => {
  const local = new LocalOptions()
  await local.migrate()
  EM.LocalOptions = local

  EM.Rule = await createRule(EM)

  EM.Extension = await createExtension(EM)

  EM.History = await createHistory(EM)

  createMessageHandler(EM)
})()
