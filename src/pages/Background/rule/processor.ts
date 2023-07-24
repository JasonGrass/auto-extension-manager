import isMatch from "./handlers/matchHandler"
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

  handle(match, targetIdArray, actionType)
}

function handle(isMatch: boolean, targetExtensions: string[], actionType: rule.ActionType) {
  // console.log(isMatch, targetExtensions, actionType)

  if (isMatch && actionType === "closeWhenMatched") {
    closeExtensions(targetExtensions)
  }

  if (isMatch && actionType === "openWhenMatched") {
    openExtensions(targetExtensions)
  }

  if (isMatch && actionType === "closeOnlyWhenMatched") {
    closeExtensions(targetExtensions)
  }
  if (!isMatch && actionType === "closeOnlyWhenMatched") {
    openExtensions(targetExtensions)
  }

  if (isMatch && actionType === "openOnlyWhenMatched") {
    openExtensions(targetExtensions)
  }
  if (!isMatch && actionType === "openOnlyWhenMatched") {
    closeExtensions(targetExtensions)
  }
}

function closeExtensions(targetExtensions: string[]) {
  for (let i = 0; i < targetExtensions.length; i++) {
    chrome.management.setEnabled(targetExtensions[i], false)
  }
}

function openExtensions(targetExtensions: string[]) {
  for (let i = 0; i < targetExtensions.length; i++) {
    chrome.management.setEnabled(targetExtensions[i], true)
  }
}

export default processRule
