import { createManualChangeGroupHandler } from "./historyMessage"
import { createCurrentScenesChangedHandler, createRuleConfigChangedHandler } from "./ruleMessage"

// Register synchronously; a cold worker may receive a message before EM is ready.
const createMessageHandler = (EM, ready = Promise.resolve()) => {
  let pending = ready
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    let payload
    try {
      payload = JSON.parse(message)
    } catch {
      return
    }
    if (
      !payload ||
      !["current-scenes-changed", "rule-config-changed", "manual-change-group"].includes(payload.id)
    ) {
      return
    }

    const handle = async () => {
      await ready
      const ctx = { message, sender, id: payload.id, params: payload.params }
      if (payload.id === "rule-config-changed") {
        await createRuleConfigChangedHandler(EM.Rule.handler)(ctx)
      } else if (payload.id === "current-scenes-changed") {
        await createCurrentScenesChangedHandler(EM.Rule.handler)(ctx)
      } else {
        await createManualChangeGroupHandler(EM)(ctx)
      }
    }
    // Keep scene persistence and configuration refresh ordered across senders.
    pending = pending.catch(() => {}).then(handle)
    pending.then(
      () => sendResponse({ state: "success" }),
      (error) => {
        console.error("Background message failed", payload.id, error)
        sendResponse({ state: "error", message: String(error.message ?? error) })
      }
    )
    return true
  })
}

export default createMessageHandler
