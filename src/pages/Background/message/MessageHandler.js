import { listen } from ".../utils/messageHelper"
import { onRuleConfigChanged } from "./RuleConfigHandler"
import { onCurrentSceneChanged } from "./SceneHandler"

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const ctx = {
    message,
    sender,
    sendResponse
  }

  /*
  listen("message id", ctx, OnMessageCallback)
  OnMessageCallback is a function that takes the message and sender as parameters, like
  OnMessageCallback(ctx),
  ctx:
  {
    "message": "{\"id\":\"current-scene-changed\",\"params\":{\"name\":\"开发模式\",\"id\":\"10LNWD41eerhzEbvnoJwL\"}}",
    "sender": {
        "id": "ildkgigifaagohmoehgmhapickcnlefd",
        "url": "chrome-extension://ildkgigifaagohmoehgmhapickcnlefd/popup.html",
        "origin": "chrome-extension://ildkgigifaagohmoehgmhapickcnlefd"
    },
    "id": "current-scene-changed",
    "params": {
        "name": "开发模式",
        "id": "10LNWD41eerhzEbvnoJwL"
    },
    sendResponse: ƒ()
  }
  */

  listen("current-scene-changed", ctx, onCurrentSceneChanged)
  listen("rule-config-changed", ctx, onRuleConfigChanged)
})
