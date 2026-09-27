import { normalizeActiveSceneIds } from ".../storage/local/activeSceneState"
import storage from ".../storage/sync"
import logger from ".../utils/logger"

export const createCurrentScenesChangedHandler = (handler) => {
  // 当前激活的情景模式集合变化时触发
  return async (ctx) => {
    logger().debug("[当前激活的情景模式集合发生变更，重新触发规则执行]", ctx)

    const { params } = ctx
    const activeSceneIds = normalizeActiveSceneIds(params?.ids)

    // The sender persists first for immediate UI feedback. Repeating the write here
    // makes messages from future callers safe and keeps background as a valid entry point.
    await storage.scene.setActiveIds(activeSceneIds)

    handler.onCurrentScenesChanged(activeSceneIds)
  }
}

export const createRuleConfigChangedHandler = (handler) => {
  // rule 配置发生变化时触发
  return async (ctx) => {
    logger().debug("[规则配置发生变更，重新触发规则执行]", ctx)
    await handler.refreshConfig()
  }
}
