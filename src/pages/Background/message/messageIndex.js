import { listen } from ".../utils/messageHelper"
import { createManualChangeGroupHandler } from "./historyMessage"
import { createCurrentScenesChangedHandler, createRuleConfigChangedHandler } from "./ruleMessage"

/**
 * 自定义 message 的处理（popup / options 页面发送过来的 message）
 */
const createMessageHandler = (EM) => {
  const ruleHandler = EM.Rule.handler
  if (!ruleHandler) {
    throw new Error("Rule handler is not defined")
  }

  // 监听其它页面（popup / options）发送给 background 的消息
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    const ctx = {
      message,
      sender,
      sendResponse
    }

    createRuleMessage(EM.Rule.handler, ctx)
    createHistoryMessage(EM, ctx)
  })
}

/*
 * 规则处理相关的 message
 */
const createRuleMessage = (handler, ctx) => {
  // 当前激活的情景模式集合发生变更
  listen("current-scenes-changed", ctx, createCurrentScenesChangedHandler(handler))

  // 规则配置发生变更
  listen("rule-config-changed", ctx, createRuleConfigChangedHandler(handler))

  ctx.sendResponse({ state: "success" })
}

/**
 * 处理历史记录相关的 message
 */
const createHistoryMessage = (EM, ctx) => {
  listen("manual-change-group", ctx, createManualChangeGroupHandler(EM))

  ctx.sendResponse({ state: "success" })
}

export default createMessageHandler

/*
  listen("message id", ctx, OnMessageCallback)
  OnMessageCallback is a function that takes the message and sender as parameters, like
  OnMessageCallback(ctx),
  ctx:
  {
    "message": "{\"id\":\"current-scenes-changed\",\"params\":{\"ids\":[\"10LNWD41eerhzEbvnoJwL\"]}}",
    "sender": {
        "id": "ildkgigifaagohmoehgmhapickcnlefd",
        "url": "chrome-extension://ildkgigifaagohmoehgmhapickcnlefd/popup.html",
        "origin": "chrome-extension://ildkgigifaagohmoehgmhapickcnlefd"
    },
    "id": "current-scenes-changed",
    "params": { "ids": ["10LNWD41eerhzEbvnoJwL"] },
    sendResponse: ƒ()
  }
*/
