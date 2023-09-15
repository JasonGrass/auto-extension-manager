/**
 * 当前情景模式是否匹配规则
 * @returns true:匹配； false:不匹配； undefined:没有 scene 匹配规则
 */
export default async function checkCurrentSceneMatch(
  scene: config.IScene | undefined,
  rule: ruleV2.IRuleConfig
): Promise<boolean | undefined> {
  const trigger = rule.match?.triggers?.find((t) => t.trigger === "sceneTrigger")

  if (!trigger) {
    return undefined
  }

  // scene 是当前用户设置的情景模式
  if (!scene?.id) {
    return false
  }

  const config = trigger.config as ruleV2.ISceneTriggerConfig
  if (!config) {
    return false
  }

  if (config.scendIds?.includes(scene.id)) {
    return true
  }

  return scene.id === config.sceneId
}
