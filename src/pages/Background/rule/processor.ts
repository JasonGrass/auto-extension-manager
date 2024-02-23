import type { IExtensionManager } from ".../types/global"
import logger from ".../utils/logger"
import { ExecuteTaskHandler, ExecuteTaskPriority } from "./ExecuteTaskHandler"
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

type RunningProcessContext = ProcessContext & {
  executeTaskHandler: ExecuteTaskHandler
}

async function processRule({ scene, rules, groups, ctx }: ProcessItem) {
  if (!rules) {
    return
  }

  // 每一轮规则的执行，使用同一个 handler 实例
  let executeTaskHandler = new ExecuteTaskHandler()

  for (const rule of rules) {
    try {
      // 每条规则处理的 rule 数据是不用的，这里需要对 ctx 拷贝一个副本，每个实例都是不同的 rule 数据
      const copyCtx = { ...ctx, rule, executeTaskHandler }
      await process(rule, scene, groups, copyCtx)
    } catch (error) {
      console.error("[规则预执行失败]", rules, error)
    }
  }

  try {
    await executeTaskHandler.execute()
  } catch (error) {
    console.error("[规则执行失败]", rules, error)
  }
}

async function process(
  rule: ruleV2.IRuleConfig,
  scene: config.IScene | undefined,
  groups: config.IGroup[] | undefined,
  ctx: RunningProcessContext
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
  ctx: RunningProcessContext
) {
  const action = config.action
  if (!action) {
    return
  }

  if (action.actionType === "none") {
    return
  }

  logger().debug(
    `[Rule] handle start. match, target, config`,
    matchResult,
    targetExtensions,
    config
  )

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
  ctx: RunningProcessContext
) {
  const actionType = action.actionType
  const isMatch = matchResult.isCurrentMatch

  const baseInfo = {
    targetExtensions: targetExtensions,
    tabInfo: ctx.tab,
    ctx: ctx
  }

  if (isMatch && actionType === "closeWhenMatched") {
    ctx.executeTaskHandler.close({
      ...baseInfo,
      reload: action.reloadAfterDisable,
      priority: new ExecuteTaskPriority()
    })
  }

  if (isMatch && actionType === "openWhenMatched") {
    ctx.executeTaskHandler.open({
      ...baseInfo,
      reload: action.reloadAfterEnable,
      priority: new ExecuteTaskPriority()
    })
  }

  if (actionType === "closeOnlyWhenMatched") {
    if (isMatch) {
      ctx.executeTaskHandler.close({
        ...baseInfo,
        reload: action.reloadAfterDisable,
        priority: new ExecuteTaskPriority()
      })
    } else {
      let priority = new ExecuteTaskPriority()
      priority.setNotMatch()
      ctx.executeTaskHandler.open({
        ...baseInfo,
        reload: action.reloadAfterEnable,
        priority: priority
      })
    }
  }

  if (actionType === "openOnlyWhenMatched") {
    if (isMatch) {
      ctx.executeTaskHandler.open({
        ...baseInfo,
        reload: action.reloadAfterEnable,
        priority: new ExecuteTaskPriority()
      })
    } else {
      let priority = new ExecuteTaskPriority()
      priority.setNotMatch()
      ctx.executeTaskHandler.close({
        ...baseInfo,
        reload: action.reloadAfterDisable,
        priority: priority
      })
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
  ctx: RunningProcessContext
) {
  if (!action.custom) {
    return
  }
  const customRule = action.custom
  const tabInfo = ctx.tab

  const open = (
    reload: boolean | undefined,
    priority: ExecuteTaskPriority = new ExecuteTaskPriority()
  ) => {
    ctx.executeTaskHandler.open({
      targetExtensions: targetExtensions,
      reload: reload,
      tabInfo: tabInfo,
      ctx: ctx,
      priority: priority
    })
  }

  const close = (
    reload: boolean | undefined,
    priority: ExecuteTaskPriority = new ExecuteTaskPriority()
  ) => {
    ctx.executeTaskHandler.close({
      targetExtensions: targetExtensions,
      reload: reload,
      tabInfo: tabInfo,
      ctx: ctx,
      priority: priority
    })
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
    let priority = new ExecuteTaskPriority()
    priority.setNotMatch()
    open(action.reloadAfterEnable, priority)
  }

  if (
    customRule.timeWhenEnable === "notMatch" &&
    customRule.urlMatchWhenEnable === "allNotMatch" &&
    !matchResult.isAnyMatch
  ) {
    let priority = new ExecuteTaskPriority()
    priority.setNotMatch()
    open(action.reloadAfterEnable, priority)
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
    let priority = new ExecuteTaskPriority()
    priority.setNotMatch()
    close(action.reloadAfterDisable, priority)
  }

  if (
    customRule.timeWhenDisable === "notMatch" &&
    customRule.urlMatchWhenDisable === "allNotMatch" &&
    !matchResult.isAnyMatch
  ) {
    let priority = new ExecuteTaskPriority()
    priority.setNotMatch()
    close(action.reloadAfterDisable, priority)
  }

  if (customRule.timeWhenDisable === "closeWindow") {
    // 暂未实现
  }
}

export default processRule
