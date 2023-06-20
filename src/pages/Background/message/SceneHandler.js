import { SceneOptions } from ".../storage"

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

  ctx.sendResponse()
}
