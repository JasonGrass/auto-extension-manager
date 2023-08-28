import logger from ".../utils/logger"
import createExtension from "./extension"
import createHistory from "./history"
import createRule from "./rule"

console.log(`[Extension Manager] Background Run. ${new Date().toLocaleString()}`)

// 日志初始化
logger().init()

// ExtensionManager 全局对象
const EM = {}

// initial running
;(async () => {
  EM.Rule = await createRule(EM)

  EM.Extension = await createExtension(EM)

  EM.History = await createHistory(EM)
})()
