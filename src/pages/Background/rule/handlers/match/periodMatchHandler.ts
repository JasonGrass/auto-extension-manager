import logger from ".../utils/logger"

/*
 * 当前时间是否匹配规则
 @returns true:匹配； false:不匹配； undefined:没有 时间区间 匹配规则
 */
export default async function checkCurrentTimeMatch(rule: ruleV2.IRuleConfig) {
  const trigger = rule.match?.triggers?.find((t) => t.trigger === "periodTrigger")

  if (!trigger) {
    return undefined
  }

  const config = trigger.config as ruleV2.IPeriodTriggerConfig
  if (!config) {
    return false
  }

  const time = new Date()
  const hours = String(time.getHours()).padStart(2, "0")
  const minutes = String(time.getMinutes()).padStart(2, "0")

  const now = `${hours}${minutes}`

  const periodsString = config.periods.map((p) => `${p.start}-${p.end}`).join(",")

  for (const period of config.periods) {
    const start = period.start.replace(":", "")
    const end = period.end.replace(":", "")

    if (start <= now && now <= end) {
      logger().trace(
        `[checkCurrentTimeMatch] config: ${periodsString}; currentTime: ${now}; result: match`
      )
      return true
    }
  }

  logger().trace(
    `[checkCurrentTimeMatch] config: ${periodsString}; currentTime: ${now}; result: not match`
  )
  return false
}
