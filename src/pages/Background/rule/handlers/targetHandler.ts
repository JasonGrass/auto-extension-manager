/**
 * 获取规则执行的目标对象（插件ID列表）
 * @param groups 用户设置的分组信息，主要从这里获取到分组对应的插件列表
 * @param rule 规则对象
 * @returns 规则适用的目标，插件ID列表
 */
function getTarget(groups: config.IGroup[] | undefined, rule: rule.IRuleConfig): string[] | null | undefined {
  const targetType = rule.target?.targetType
  if (!targetType) {
    return null
  }

  if (targetType === "single") {
    return rule.target?.targetExtensions
  }

  if (targetType === "group") {
    const groupId = rule.target.targetGroup
    if (!groupId) {
      return null
    }

    return groups?.find((g) => g.id === groupId)?.extensions
  }
}

export default getTarget
