import chromeP from "webext-polyfill-kinda"

export const notifyRuleConfigChanged = async () => {
  try {
    const response = await chromeP.runtime.sendMessage(
      JSON.stringify({ id: "rule-config-changed" })
    )
    if (response?.state !== "success") {
      throw new Error(response?.message ?? "Background did not acknowledge configuration")
    }
  } catch (cause) {
    const error = new Error("Configuration saved, but background refresh failed", { cause })
    error.code = "CONFIG_REFRESH_FAILED"
    throw error
  }
}

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
