import storage from ".../storage/sync"
import logger from ".../utils/logger"

export const createCurrentSceneChangedHandler = (handler) => {
  // 当前情景模式变化时触发
  return (ctx) => {
    logger().debug("[当前情景模式发生变更，重新触发规则执行]", ctx)

    // 1. modify active scene id local storage
    const { params } = ctx
    if (!params || !params.id || params.id === "" || params.id === "cancel") {
      // 取消了情景模式的设置
      storage.scene.setActive("")
    } else {
      storage.scene.setActive(params.id)
    }

    // 2. run rules for current scene
    handler.onCurrentSceneChanged(params)

    ctx.sendResponse()
  }
}

export const createRuleConfigChangedHandler = (handler) => {
  // rule 配置发生变化时触发
  return (ctx) => {
    logger().debug("[规则配置发生变更，重新触发规则执行]", ctx)
    storage.options.getAll().then((options) => {
      handler.setRules(options.ruleConfig)
    })
    ctx.sendResponse()
  }
}
