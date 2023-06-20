export const onCurrentSceneChanged = (ctx) => {
  console.log("onCurrentSceneChanged", ctx)
  ctx.sendResponse()
}
