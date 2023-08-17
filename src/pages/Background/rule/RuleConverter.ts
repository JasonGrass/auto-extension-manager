export default function ConvertRuleToV2(rule1: rule.IRuleConfig): ruleV2.IRuleConfig | null {
  if (!rule1) {
    return null
  }

  const tmpRule = rule1 as any
  if (tmpRule.version === 2) {
    return tmpRule
  }

  const rule2: ruleV2.IRuleConfig = {
    id: rule1.id,
    version: 2,
    enable: rule1.enable
  }

  // 1 匹配条件
  const match: ruleV2.IMatch = {
    relationship: "and",
    triggers: []
  }

  if (rule1.match?.matchMode === "host") {
    match.triggers.push({
      trigger: "urlTrigger",
      config: {
        matchMethod: rule1.match.matchMethod,
        matchUrl: rule1.match.matchHost ?? []
      }
    })
  }

  if (rule1.match?.matchMode === "scene") {
    match.triggers.push({
      trigger: "sceneTrigger",
      config: {
        sceneId: rule1.match.matchScene ?? ""
      }
    })
  }

  // 2 目标

  const target: ruleV2.ITarget = {
    groups: [],
    extensions: []
  }

  if (rule1.target?.targetType === "group") {
    if (rule1.target.targetGroup) {
      target.groups.push(rule1.target.targetGroup)
    }
  }
  if (rule1.target?.targetType === "single") {
    target.extensions = rule1.target.targetExtensions
  }

  // 3 动作
  const action: ruleV2.IAction = {
    actionType: rule1.action.actionType,
    reloadAfterEnable: false,
    reloadAfterDisable: false
  }

  if (rule1.action.isAdvanceMode) {
    action.actionType = "custom"
    action.reloadAfterEnable = rule1.action.refreshAfterOpen ?? false
    action.reloadAfterDisable = rule1.action.refreshAfterClose ?? false

    const custom: ruleV2.ICustomAction = {
      timeWhenEnable: "none",
      timeWhenDisable: "none"
    }

    // 开启时机
    if (rule1.action.timeWhenEnable === "current") {
      custom.timeWhenEnable = "match"
      custom.urlMatchWhenEnable = "currentMatch"
    }
    if (rule1.action.timeWhenEnable === "any") {
      custom.timeWhenEnable = "match"
      custom.urlMatchWhenEnable = "anyMatch"
    }
    if (rule1.action.timeWhenEnable === "notCurrent") {
      custom.timeWhenEnable = "notMatch"
      custom.urlMatchWhenEnable = "currentNotMatch"
    }
    if (rule1.action.timeWhenEnable === "noAny") {
      custom.timeWhenEnable = "notMatch"
      custom.urlMatchWhenEnable = "allNotMatch"
    }

    // 关闭时机
    if (rule1.action.timeWhenDisable === "current") {
      custom.timeWhenDisable = "match"
      custom.urlMatchWhenDisable = "currentMatch"
    }
    if (rule1.action.timeWhenDisable === "any") {
      custom.timeWhenDisable = "match"
      custom.urlMatchWhenDisable = "anyMatch"
    }
    if (rule1.action.timeWhenDisable === "notCurrent") {
      custom.timeWhenDisable = "notMatch"
      custom.urlMatchWhenDisable = "currentNotMatch"
    }
    if (rule1.action.timeWhenDisable === "noAny") {
      custom.timeWhenDisable = "notMatch"
      custom.urlMatchWhenDisable = "allNotMatch"
    }

    action.custom = custom
  }

  rule2.match = match
  rule2.target = target
  rule2.action = action

  return rule2
}
