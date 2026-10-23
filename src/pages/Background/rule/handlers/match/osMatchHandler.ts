import chromeP from "webext-polyfill-kinda"

import logger from ".../utils/logger"

let platform: Promise<chrome.runtime.PlatformInfo> | undefined
const getPlatform = () =>
  (platform ??= chromeP.runtime.getPlatformInfo().catch((error) => {
    platform = undefined
    throw error
  }))

/**
 * 当前操作系统是否匹配规则
 * @returns true:匹配； false:不匹配； undefined:没有 OS 匹配规则
 */
export default async function checkCurrentOsMatch(rule: ruleV2.IRuleConfig) {
  const trigger = rule.match?.triggers?.find((t) => t.trigger === "osTrigger")

  if (!trigger) {
    return undefined
  }

  const platformInfo = await getPlatform()
  const currentOsType = platformInfo.os

  const config = trigger.config as ruleV2.IOsTriggerConfig
  if (!config) {
    return false
  }

  const result = config.os.includes(currentOsType)
  logger().debug(
    `[checkCurrentOsMatch] config: ${config.os}; currentOs:${currentOsType}; result:${result}`
  )
  return result
}
