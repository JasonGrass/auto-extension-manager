/**
 * 获取规则执行的目标对象（插件ID列表）
 * @param groups 用户设置的分组信息，主要从这里获取到分组对应的插件列表
 * @param rule 规则对象
 * @returns 规则适用的目标，插件ID列表
 */
export default function getTarget(
  groups: config.IGroup[] | undefined,
  rule: ruleV2.IRuleConfig
): string[] {
  const groupIds = rule.target?.groups ?? []
  const extensions = rule.target?.extensions ?? []

  const groupExtensions =
    groups
      ?.filter((g) => groupIds.includes(g.id))
      .map((g) => g.extensions)
      .flat() ?? []

  const all = [...groupExtensions, ...extensions]

  return Array.from(new Set(all))
}
