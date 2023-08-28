import { SceneOptions } from ".../storage"
import logger from ".../utils/logger"

export const createCurrentSceneChangedHandler = (EM) => {
  // 当前情景模式变化时触发
  return (ctx) => {
    logger().trace("[当前情景模式发生变更，重新触发规则执行]", ctx)

    // 1. modify active scene id local storage
    const { params } = ctx
    if (!params || !params.id || params.id === "" || params.id === "cancel") {
      // 取消了情景模式的设置
      SceneOptions.setActive("")
    } else {
      SceneOptions.setActive(params.id)
    }

    // 2. run rules for current scene
    EM.Rule.handler.onCurrentSceneChanged(params)

    ctx.sendResponse()
  }
}
