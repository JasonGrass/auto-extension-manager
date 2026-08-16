/**
 * 当前情景模式是否匹配规则
 * @returns true:匹配； false:不匹配； undefined:没有 scene 匹配规则
 */
export default async function checkCurrentSceneMatch(
  activeSceneIds: string[] | undefined,
  rule: ruleV2.IRuleConfig
): Promise<boolean | undefined> {
  const trigger = rule.match?.triggers?.find((t) => t.trigger === "sceneTrigger")

  if (!trigger) {
    return undefined
  }

  if (!activeSceneIds || activeSceneIds.length === 0) {
    return false
  }

  const config = trigger.config as ruleV2.ISceneTriggerConfig
  if (!config) {
    return false
  }

  // sceneIds is an OR-list in existing rule configuration. With multiple active
  // scenes, the trigger matches when the configured and active sets intersect.
  const configuredIds = [...(config.sceneIds ?? [])]
  if (config.sceneId) {
    configuredIds.push(config.sceneId)
  }
  const activeIdSet = new Set(activeSceneIds)
  return configuredIds.some((id) => activeIdSet.has(id))
}
