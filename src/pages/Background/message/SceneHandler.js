import { SceneOptions } from ".../storage"
import createRuleHandler from "../rule/RuleHandler"

/**
 * 当前情景模式变化时触发
 */
export const onCurrentSceneChanged = (ctx) => {
  // console.log("onCurrentSceneChanged", ctx)

  // 1. modify active scene id local storage
  const { params } = ctx
  if (!params || !params.id || params.id === "" || params.id === "cancel") {
    // 取消了情景模式的设置
    SceneOptions.setActive("")
  } else {
    SceneOptions.setActive(params.id)
  }

  // 2. run rules for current scene
  const handler = createRuleHandler()
  handler.onCurrentSceneChanged(params)

  ctx.sendResponse()
}
