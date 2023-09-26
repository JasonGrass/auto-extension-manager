import chromeP from "webext-polyfill-kinda"

import type { IExtensionManager } from ".../types/global"
import { DelayCloseToken, getDelayCloser } from "./delayCloser"
import isMatch, { IMatchResult } from "./handlers/matchHandler"
import getTarget from "./handlers/targetHandler"

/**
 * 根据当前情景模式，标签页信息，规则信息，处理扩展的打开或关闭
 */

export type ProcessContext = {
  /**
   * 自身插件的信息
   */
  self: chrome.management.ExtensionInfo
  /**
   * 当前激活的 tab
   */
  tab: chrome.tabs.Tab | undefined
  /**
   * 当前浏览器打开的全部 tab
   */
  tabs: chrome.tabs.Tab[]

  /**
   * 当前正在执行的规则
   */
  rule?: ruleV2.IRuleConfig

  /**
   * 全局对象
   */
  EM?: IExtensionManager
}

type ProcessItem = {
  /**
   * 当前场景
   */
  scene: config.IScene | undefined
  /**
   * 用户配置的分组数据
   */
  groups: config.IGroup[] | undefined
  /**
   * 所有规则
   */
  rules: ruleV2.IRuleConfig[] | undefined
  /**
   * 执行上下文
   */
  ctx: ProcessContext
}

async function processRule({ scene, rules, groups, ctx }: ProcessItem) {
  if (!rules) {
    return
  }

  for (const rule of rules) {
    try {
      // 每条规则处理的 rule 数据是不用的，这里需要对 ctx 拷贝一个副本，每个实例都是不同的 rule 数据
      const copyCtx = { ...ctx, rule }
      await process(rule, scene, groups, copyCtx)
    } catch (error) {
      console.error("[规则执行失败]", rules, error)
    }
  }
}

async function process(
  rule: ruleV2.IRuleConfig,
  scene: config.IScene | undefined,
  groups: config.IGroup[] | undefined,
  ctx: ProcessContext
) {
  // 规则没有生效
  if (!rule.enable) {
    return
  }

  const match = await isMatch(scene, rule, ctx)

  const targetIdArray = getTarget(groups, rule)
  if (!targetIdArray || targetIdArray.length === 0) {
    return
  }
  // 执行目标中，过滤掉自己
  const targetExtensionIds = targetIdArray.filter((id) => id !== ctx.self.id)

  handle(match, targetExtensionIds, rule, ctx)
}

function handle(
  matchResult: IMatchResult,
  targetExtensions: string[],
  config: ruleV2.IRuleConfig,
  ctx: ProcessContext
) {
  const action = config.action
  if (!action) {
    return
  }

  if (action.actionType === "none") {
    return
  }

  if (action.actionType === "custom") {
    handleAdvanceMode(matchResult, targetExtensions, action, ctx)
  } else {
    handleSimpleMode(matchResult, targetExtensions, action, ctx)
  }
}

/**
 * 简单模式下的动作执行
 */
function handleSimpleMode(
  matchResult: IMatchResult,
  targetExtensions: string[],
  action: ruleV2.IAction,
  ctx: ProcessContext
) {
  const actionType = action.actionType

  const isMatch = matchResult.isCurrentMatch

  const tabInfo = ctx.tab

  if (isMatch && actionType === "closeWhenMatched") {
    closeExtensions(targetExtensions, action.reloadAfterDisable, tabInfo, ctx)
  }

  if (isMatch && actionType === "openWhenMatched") {
    openExtensions(targetExtensions, action.reloadAfterEnable, tabInfo, ctx)
  }

  if (actionType === "closeOnlyWhenMatched") {
    if (isMatch) {
      closeExtensions(targetExtensions, action.reloadAfterDisable, tabInfo, ctx)
    } else {
      openExtensions(targetExtensions, action.reloadAfterEnable, tabInfo, ctx)
    }
  }

  if (actionType === "openOnlyWhenMatched") {
    if (isMatch) {
      openExtensions(targetExtensions, action.reloadAfterEnable, tabInfo, ctx)
    } else {
      closeExtensions(targetExtensions, action.reloadAfterDisable, tabInfo, ctx)
    }
  }
}

/**
 * 高级模式下的动作执行
 */
async function handleAdvanceMode(
  matchResult: IMatchResult,
  targetExtensions: string[],
  action: ruleV2.IAction,
  ctx: ProcessContext
) {
  if (!action.custom) {
    return
  }
  const customRule = action.custom
  const tabInfo = ctx.tab

  const open = (reload: boolean | undefined) => {
    openExtensions(targetExtensions, reload, tabInfo, ctx)
  }
  const close = (reload: boolean | undefined) => {
    closeExtensions(targetExtensions, reload, tabInfo, ctx)
  }

  // 开启插件的判断
  if (
    customRule.timeWhenEnable === "match" &&
    customRule.urlMatchWhenEnable === "currentMatch" &&
    matchResult.isCurrentMatch
  ) {
    open(action.reloadAfterEnable)
  }

  if (
    customRule.timeWhenEnable === "match" &&
    customRule.urlMatchWhenEnable === "anyMatch" &&
    matchResult.isAnyMatch
  ) {
    open(matchResult.isCurrentMatch && action.reloadAfterEnable)
  }

  if (
    customRule.timeWhenEnable === "notMatch" &&
    customRule.urlMatchWhenEnable === "currentNotMatch" &&
    !matchResult.isCurrentMatch
  ) {
    open(action.reloadAfterEnable)
  }

  if (
    customRule.timeWhenEnable === "notMatch" &&
    customRule.urlMatchWhenEnable === "allNotMatch" &&
    !matchResult.isAnyMatch
  ) {
    open(action.reloadAfterEnable)
  }

  // 禁用插件的判断

  if (
    customRule.timeWhenDisable === "match" &&
    customRule.urlMatchWhenDisable === "currentMatch" &&
    matchResult.isCurrentMatch
  ) {
    close(action.reloadAfterDisable)
  }

  if (
    customRule.timeWhenDisable === "match" &&
    customRule.urlMatchWhenDisable === "anyMatch" &&
    matchResult.isAnyMatch
  ) {
    close(matchResult.isCurrentMatch && action.reloadAfterDisable)
  }

  if (
    customRule.timeWhenDisable === "notMatch" &&
    customRule.urlMatchWhenDisable === "currentNotMatch" &&
    !matchResult.isCurrentMatch
  ) {
    close(action.reloadAfterDisable)
  }

  if (
    customRule.timeWhenDisable === "notMatch" &&
    customRule.urlMatchWhenDisable === "allNotMatch" &&
    !matchResult.isAnyMatch
  ) {
    close(action.reloadAfterDisable)
  }

  if (customRule.timeWhenDisable === "closeWindow") {
    // 暂未实现
  }
}

async function closeExtensions(
  targetExtensions: string[],
  reload: boolean | undefined,
  tabInfo: chrome.tabs.Tab | undefined,
  ctx: ProcessContext
) {
  let worked = false

  let delayToken: DelayCloseToken | undefined
  for (const extId of targetExtensions) {
    try {
      const info = await chromeP.management.get(extId)
      if (!info || !info.enabled) {
        continue
      }

      const delayCloser = getDelayCloser()
      delayToken = delayCloser.close(info, () => {
        // 历史记录
        ctx.EM?.History.EventHandler.onAutoDisabled(info, ctx.rule!)
      })

      worked = true
    } catch (err) {
      console.warn(`Disable Extension fail (${extId}).`, err)
    }
  }

  if (worked && reload && tabInfo && tabInfo.id) {
    const token = delayToken
    const closureTabInfo = tabInfo
    setTimeout(async () => {
      if (token?.Available) {
        try {
          await chrome.tabs.reload(closureTabInfo.id!)
          console.log(
            `[Extension Manager] reload tab [${closureTabInfo.title}](${closureTabInfo.url})`
          )
        } catch (err) {
          console.warn(`closeExtensions reload tab fail.`, tabInfo, err)
        }
      }
    }, DelayCloseToken.DelayTime + 50)
  }
}

async function openExtensions(
  targetExtensions: string[],
  reload: boolean | undefined,
  tabInfo: chrome.tabs.Tab | undefined,
  ctx: ProcessContext
) {
  let worked = false

  for (const extId of targetExtensions) {
    try {
      const delayCloser = getDelayCloser()
      delayCloser.cancel(extId)

      const info = await chromeP.management.get(extId)
      if (!info || info.enabled) {
        continue
      }

      console.log(`[Extension Manager] enable extension [${info.name}]`)
      await chromeP.management.setEnabled(extId, true)
      ctx.EM?.History.EventHandler.onAutoEnabled(info, ctx.rule!)
      worked = true
    } catch (err) {
      console.warn(`Enable Extension fail (${extId}).`, err)
    }
  }

  if (worked && reload && tabInfo && tabInfo.id) {
    chrome.tabs.reload(tabInfo.id)
    console.log(`[Extension Manager] reload tab [${tabInfo.title}](${tabInfo.url})`)
  }
}

export default processRule
