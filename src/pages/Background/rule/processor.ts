import chromeP from "webext-polyfill-kinda"

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
      await process(rule, scene, groups, ctx)
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

  if (action.actionType === "custom") {
    handleAdvanceMode(matchResult, targetExtensions, action, ctx.tab)
  } else {
    handleSimpleMode(matchResult, targetExtensions, action, ctx.tab)
  }
}

/**
 * 简单模式下的动作执行
 */
function handleSimpleMode(
  matchResult: IMatchResult,
  targetExtensions: string[],
  action: ruleV2.IAction,
  tabInfo: chrome.tabs.Tab | undefined
) {
  const actionType = action.actionType

  const isMatch = matchResult.isCurrentMatch

  if (isMatch && actionType === "closeWhenMatched") {
    closeExtensions(targetExtensions, action.reloadAfterDisable, tabInfo)
  }

  if (isMatch && actionType === "openWhenMatched") {
    openExtensions(targetExtensions, action.reloadAfterEnable, tabInfo)
  }

  if (actionType === "closeOnlyWhenMatched") {
    if (isMatch) {
      closeExtensions(targetExtensions, action.reloadAfterDisable, tabInfo)
    } else {
      openExtensions(targetExtensions, action.reloadAfterEnable, tabInfo)
    }
  }

  if (actionType === "openOnlyWhenMatched") {
    if (isMatch) {
      openExtensions(targetExtensions, action.reloadAfterEnable, tabInfo)
    } else {
      closeExtensions(targetExtensions, action.reloadAfterDisable, tabInfo)
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
  tabInfo: chrome.tabs.Tab | undefined
) {
  if (!action.custom) {
    return
  }
  const customRule = action.custom

  const open = (reload: boolean) => {
    openExtensions(targetExtensions, reload, tabInfo)
  }
  const close = (reload: boolean) => {
    closeExtensions(targetExtensions, reload, tabInfo)
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
  reload: boolean,
  tabInfo: chrome.tabs.Tab | undefined
) {
  let worked = false

  for (const extId of targetExtensions) {
    const info = await chromeP.management.get(extId)
    if (!info || !info.enabled) {
      continue
    }
    console.log(`[Extension Manager] disable extension [${info.name}]`)
    await chrome.management.setEnabled(extId, false)
    worked = true
  }

  if (worked && reload && tabInfo && tabInfo.id) {
    chrome.tabs.reload(tabInfo.id)
    console.log(`[Extension Manager] reload tab [${tabInfo.title}](${tabInfo.url})`)
  }
}

async function openExtensions(
  targetExtensions: string[],
  reload: boolean,
  tabInfo: chrome.tabs.Tab | undefined
) {
  let worked = false

  for (const extId of targetExtensions) {
    const info = await chromeP.management.get(extId)
    if (!info || info.enabled) {
      continue
    }
    await chromeP.management.setEnabled(extId, true)
    console.log(`[Extension Manager] enable extension [${info.name}]`)
    worked = true
  }

  if (worked && reload && tabInfo && tabInfo.id) {
    chrome.tabs.reload(tabInfo.id)
    console.log(`[Extension Manager] reload tab [${tabInfo.title}](${tabInfo.url})`)
  }
}

export default processRule
