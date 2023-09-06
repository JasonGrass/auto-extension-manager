import chromeP from "webext-polyfill-kinda"

export const sendMessage = async (message, params) => {
  try {
    const msg = {
      id: message,
      params: params
    }
    return await chromeP.runtime.sendMessage(JSON.stringify(msg))
  } catch (error) {
    console.log("sendMessage", error)
  }
}

export const listen = async (message, ctx, callback) => {
  const msg = JSON.parse(ctx.message)
  if (message !== msg.id) {
    return
  }

  callback?.({
    ...ctx,
    id: msg.id,
    params: msg.params
  })
}
