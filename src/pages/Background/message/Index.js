import { listen } from ".../utils/messageHelper"
import { createRuleConfigChangedHandler } from "./RuleConfigHandler"
import { createCurrentSceneChangedHandler } from "./SceneHandler"

/*
 * 规则处理相关的 message
 */
const createRuleMessage = (EM) => {
  if (!EM.Rule.handler) {
    throw new Error("Rule handler is not defined")
  }

  // 监听其它页面（popup / options）发送给 background 的消息
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    const ctx = {
      message,
      sender,
      sendResponse
    }

    // 当前情况模式发生变更
    listen("current-scene-changed", ctx, createCurrentSceneChangedHandler(EM))

    // 规则配置发生变更
    listen("rule-config-changed", ctx, createRuleConfigChangedHandler(EM))
  })

  return {}
}

export default createRuleMessage

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
