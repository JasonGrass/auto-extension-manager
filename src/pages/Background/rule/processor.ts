import chromeP from "webext-polyfill-kinda"
import isMatch, { getAdvanceMatchType } from "./handlers/matchHandler"
import getTarget from "./handlers/targetHandler"

/**
 * 根据当前情景模式，标签页信息，规则信息，处理扩展的打开或关闭
 */

type processItem = {
  scene: config.IScene | undefined,
  tabInfo: chrome.tabs.Tab | undefined,
  rules: rule.IRuleConfig[] | undefined,
  groups: config.IGroup[] | undefined

}

function processRule({ scene, tabInfo, rules, groups }: processItem) {
  // console.log("processRule")
  // console.log(scene)
  // console.log(tabInfo)
  // console.log(rules)
  // console.log(groups)

  if (!rules) {
    return
  }

  for (let i = 0; i < rules.length; i++) {
    try {
      process(rules[i], scene, tabInfo, groups)
    } catch (error) {
      console.error("process rule error", rules[i], error)
    }
  }
}

function process(
  rule: rule.IRuleConfig,
  scene: config.IScene | undefined,
  tabInfo: chrome.tabs.Tab | undefined,
  groups: config.IGroup[] | undefined) {
  if (!rule.enable) {
    return
  }

  const match = isMatch(scene, tabInfo, rule)

  const targetIdArray = getTarget(groups, rule)
  if (!targetIdArray || targetIdArray.length === 0) {
    return
  }

  const { actionType } = rule.action
  if (!actionType) {
    return
  }

  handle(match, targetIdArray, rule, tabInfo)
}

function handle(
  isMatch: boolean,
  targetExtensions: string[],
  config: rule.IRuleConfig,
  tabInfo: chrome.tabs.Tab | undefined) {
  // console.log(isMatch, targetExtensions, actionType)

  const action = config.action
  if (!action.isAdvanceMode || config.match.matchMode === "scene") {
    handleSimpleMode(isMatch, targetExtensions, action, tabInfo)
  }
  else {
    handleAdvanceMode(targetExtensions, config, tabInfo)
  }
}

/**
 * 简单模式下的动作执行
*/
function handleSimpleMode(
  isMatch: boolean,
  targetExtensions: string[],
  action: rule.IAction,
  tabInfo: chrome.tabs.Tab | undefined) {
  const actionType = action.actionType

  if (isMatch && actionType === "closeWhenMatched") {
    closeExtensions(targetExtensions, action, tabInfo)
  }

  if (isMatch && actionType === "openWhenMatched") {
    openExtensions(targetExtensions, action, tabInfo)
  }

  if (isMatch && actionType === "closeOnlyWhenMatched") {
    closeExtensions(targetExtensions, action, tabInfo)
  }
  if (!isMatch && actionType === "closeOnlyWhenMatched") {
    openExtensions(targetExtensions, action, tabInfo)
  }

  if (isMatch && actionType === "openOnlyWhenMatched") {
    openExtensions(targetExtensions, action, tabInfo)
  }
  if (!isMatch && actionType === "openOnlyWhenMatched") {
    closeExtensions(targetExtensions, action, tabInfo)
  }
}

/**
 * 高级模式下的动作执行
*/
async function handleAdvanceMode(
  targetExtensions: string[],
  rule: rule.IRuleConfig,
  tabInfo: chrome.tabs.Tab | undefined) {
  const matchType = await getAdvanceMatchType(tabInfo?.url, rule)

  // 启用插件
  if (matchType.currentTabMatch && rule.action.timeWhenEnable === "current") {
    openExtensions(targetExtensions, rule.action, tabInfo)
  }
  else if (!matchType.currentTabMatch && rule.action.timeWhenEnable === "notCurrent") {
    openExtensions(targetExtensions, rule.action, tabInfo)
  }
  else if (matchType.anyTabMatch && rule.action.timeWhenEnable === "any") {
    openExtensions(targetExtensions, rule.action, tabInfo)
  }
  else if (!matchType.anyTabMatch && rule.action.timeWhenEnable === "noAny") {
    openExtensions(targetExtensions, rule.action, tabInfo)
  }

  // 禁用插件
  if (matchType.currentTabMatch && rule.action.timeWhenDisable === "current") {
    closeExtensions(targetExtensions, rule.action, tabInfo)
  }
  else if (!matchType.currentTabMatch && rule.action.timeWhenDisable === "notCurrent") {
    closeExtensions(targetExtensions, rule.action, tabInfo)
  }
  else if (matchType.anyTabMatch && rule.action.timeWhenDisable === "any") {
    closeExtensions(targetExtensions, rule.action, tabInfo)
  }
  else if (!matchType.anyTabMatch && rule.action.timeWhenDisable === "noAny") {
    closeExtensions(targetExtensions, rule.action, tabInfo)
  }

}



async function closeExtensions(
  targetExtensions: string[],
  action: rule.IAction,
  tabInfo: chrome.tabs.Tab | undefined,) {
  for (let i = 0; i < targetExtensions.length; i++) {

    const extId = targetExtensions[i]
    const info = await chromeP.management.get(extId)
    if (!info || !info.enabled) {
      continue
    }

    console.log(`[Extension Manager] disable extension [${info.name}]`)
    await chrome.management.setEnabled(targetExtensions[i], false)
    if (action.isAdvanceMode && action.refreshAfterClose && tabInfo && tabInfo.id) {
      chrome.tabs.reload(tabInfo.id)
      console.log(`[Extension Manager] reload tab [${tabInfo.title}](${tabInfo.url})`)
    }
  }
}

async function openExtensions(
  targetExtensions: string[],
  action: rule.IAction,
  tabInfo: chrome.tabs.Tab | undefined,) {
  for (let i = 0; i < targetExtensions.length; i++) {

    const extId = targetExtensions[i]
    const info = await chromeP.management.get(extId)
    if (!info || info.enabled) {
      continue
    }

    await chromeP.management.setEnabled(targetExtensions[i], true)
    console.log(`[Extension Manager] enable extension [${info.name}]`)

    if (action.isAdvanceMode && action.refreshAfterOpen && tabInfo && tabInfo.id) {
      chrome.tabs.reload(tabInfo.id)
      console.log(`[Extension Manager] reload tab [${tabInfo.title}](${tabInfo.url})`)
    }

  }
}

export default processRule
