import storage from ".../storage"
import logger from ".../utils/logger"

export const createRuleConfigChangedHandler = (EM) => {
  // rule 配置发生变化时触发
  return (ctx) => {
    logger().trace("[规则配置发生变更，重新触发规则执行]", ctx)
    storage.options.getAll().then((options) => {
      EM.Rule.handler.setRules(options.ruleConfig)
    })
    ctx.sendResponse()
  }
}
