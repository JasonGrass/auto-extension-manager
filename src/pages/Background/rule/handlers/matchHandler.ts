import chromeP from "webext-polyfill-kinda"

import logger from ".../utils/logger"
import type { ProcessContext } from "../processor"
import checkCurrentOsMatch from "./match/osMatchHandler"
import checkCurrentTimeMatch from "./match/periodMatchHandler"
import checkCurrentSceneMatch from "./match/sceneMatchHandler"
import checkCurrentUrlMatch, { checkAnyUrlMatch } from "./match/urlMatchHandler"

export interface IMatchResult {
  /**
   * 按当前标签计算，是否匹配
   */
  isCurrentMatch: boolean

  /**
   * 按当前标签计算，是否不匹配
   */
  isAnyMatch: boolean
}

/**
 * 判断当前状态（情景模式，当前 URL）是否与指定规则匹配
 * @param scene 当前的情景模式
 * @param tabInfo 当前标签页的信息
 * @param rule 规则数据
 */
export default async function isMatch(
  scene: config.IScene | undefined,
  rule: ruleV2.IRuleConfig,
  ctx: ProcessContext
): Promise<IMatchResult> {
  const result: IMatchResult = {
    isCurrentMatch: false,
    isAnyMatch: false
  }

  if (!rule.match) {
    return result
  }

  const isCurrentUrlMatch = await checkCurrentUrlMatch(ctx.tab, rule)
  const isAnyUrlMatch = isCurrentUrlMatch || (await checkAnyUrlMatch(ctx.tabs, rule))
  const isCurrentSceneMatch = await checkCurrentSceneMatch(scene, rule)
  const isCurrentOsMatch = await checkCurrentOsMatch(rule)
  const isCurrentTimeMatch = await checkCurrentTimeMatch(rule)

  const list = [
    isCurrentUrlMatch,
    isAnyUrlMatch,
    isCurrentSceneMatch,
    isCurrentOsMatch,
    isCurrentTimeMatch
  ]
  if (list.filter((m) => m !== undefined).length === 0) {
    // 没有任何匹配条件，直接返回 不匹配
    return result
  }

  // 当前标签是否匹配
  const currentCheckList = [
    isCurrentUrlMatch,
    isCurrentSceneMatch,
    isCurrentOsMatch,
    isCurrentTimeMatch
  ].filter((m) => m !== undefined)

  // 任一标签是否匹配
  const anyCheckList = [
    isAnyUrlMatch,
    isCurrentSceneMatch,
    isCurrentOsMatch,
    isCurrentTimeMatch
  ].filter((m) => m !== undefined)

  const relationship = rule.match.relationship
  if (relationship === "and") {
    if (currentCheckList.filter((m) => m === true).length === currentCheckList.length) {
      result.isCurrentMatch = true
    }
    if (anyCheckList.filter((m) => m === true).length === anyCheckList.length) {
      result.isAnyMatch = true
    }
  } else if (relationship === "or") {
    if (currentCheckList.filter((m) => m === true).length > 0) {
      result.isCurrentMatch = true
    }
    if (anyCheckList.filter((m) => m === true).length > 0) {
      result.isAnyMatch = true
    }
  }

  // logger().trace(`[matchHandler]`, rule, result)

  return result
}

export async function isMatchByCurrent(
  activeScene: config.IScene | undefined,
  rule: ruleV2.IRuleConfig,
  tabInfo: chrome.tabs.Tab | undefined
): Promise<boolean> {
  if (!rule.match) {
    return false
  }

  const isCurrentUrlMatch = await checkCurrentUrlMatch(tabInfo, rule)
  const isCurrentSceneMatch = await checkCurrentSceneMatch(activeScene, rule)
  const isCurrentOsMatch = await checkCurrentOsMatch(rule)
  const isCurrentTimeMatch = await checkCurrentTimeMatch(rule)

  const currentCheckList = [
    isCurrentUrlMatch,
    isCurrentSceneMatch,
    isCurrentOsMatch,
    isCurrentTimeMatch
  ].filter((m) => m !== undefined)

  const relationship = rule.match.relationship
  if (relationship === "and") {
    return currentCheckList.filter((m) => m === true).length === currentCheckList.length
  } else if (relationship === "or") {
    return currentCheckList.filter((m) => m === true).length > 0
  }

  return false
}
