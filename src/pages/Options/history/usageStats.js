/**
 * 扩展使用统计（纯函数，便于单测）
 *
 * 原则：数字统计在代码里算好，LLM 只负责归纳结论和组织语言。
 * 让模型做算术既浪费 token 又容易算错。
 */

const ONE_DAY_MS = 24 * 60 * 60 * 1000

/** 距上次启用超过该天数且当前仍启用 → 建议禁用 */
export const UNUSED_DAYS_THRESHOLD = 90
/** 安装超过该天数且从未启用过 → 建议检查 */
export const NEVER_USED_DAYS_THRESHOLD = 30

/**
 * @param {number} timestamp 事件时间戳 ms
 * @param {number} now 当前时间戳 ms
 * @returns {number} 相隔天数（向下取整，不足一天为 0）
 */
export function daysBetween(timestamp, now) {
  if (typeof timestamp !== "number" || !Number.isFinite(timestamp)) {
    return null
  }
  return Math.floor((now - timestamp) / ONE_DAY_MS)
}

/**
 * 从历史记录中提取每个扩展的启用时间戳集合
 *
 * @param {Array<{timestamp: number, event: string, extensionId: string}>} records
 * @returns {Map<string, number[]>} extensionId → 启用事件时间戳列表
 */
export function collectEnableTimestamps(records) {
  const map = new Map()
  for (const record of records ?? []) {
    if (record?.event !== "enabled") {
      continue
    }
    if (!record.extensionId || typeof record.timestamp !== "number") {
      continue
    }
    const list = map.get(record.extensionId)
    if (list) {
      list.push(record.timestamp)
    } else {
      map.set(record.extensionId, [record.timestamp])
    }
  }
  return map
}

/**
 * 从历史记录中提取每个扩展的最早安装时间
 * 多次卸载重装时取最早一次，反映"认识它多久了"
 */
export function collectInstallTimestamps(records) {
  const map = new Map()
  for (const record of records ?? []) {
    if (record?.event !== "install") {
      continue
    }
    if (!record.extensionId || typeof record.timestamp !== "number") {
      continue
    }
    const exist = map.get(record.extensionId)
    if (exist === undefined || record.timestamp < exist) {
      map.set(record.extensionId, record.timestamp)
    }
  }
  return map
}

/**
 * 构建使用统计与减负候选
 *
 * @param {Array<{timestamp: number, event: string, extensionId: string}>} records
 * @param {Array<{id: string, name: string, enabled: boolean}>} extensions
 * @param {number} now 当前时间戳 ms
 * @returns {{extStats: Array, candidates: Array}}
 *   extStats: [{ id, name, enabled, enableCount, lastEnableDaysAgo, installDaysAgo }]
 *   candidates: [{ type: "disable"|"review", id, name, days }]
 */
export function buildUsageStats(records, extensions, now) {
  const enableTimes = collectEnableTimestamps(records)
  const installTimes = collectInstallTimestamps(records)

  const extStats = []
  const disableCandidates = []
  const reviewCandidates = []

  for (const ext of extensions ?? []) {
    if (!ext?.id) {
      continue
    }

    const times = enableTimes.get(ext.id) ?? []
    const lastEnableTime = times.length > 0 ? Math.max(...times) : null

    const stat = {
      id: ext.id,
      name: ext.name ?? ext.id,
      enabled: ext.enabled === true,
      enableCount: times.length,
      lastEnableDaysAgo: lastEnableTime === null ? null : daysBetween(lastEnableTime, now),
      installDaysAgo: installTimes.has(ext.id) ? daysBetween(installTimes.get(ext.id), now) : null
    }
    extStats.push(stat)

    // 候选筛选是确定性的规则，LLM 只在此基础上归纳和措辞
    if (stat.enabled && lastEnableTime === null && stat.installDaysAgo !== null) {
      if (stat.installDaysAgo >= NEVER_USED_DAYS_THRESHOLD) {
        reviewCandidates.push({
          type: "review",
          id: ext.id,
          name: stat.name,
          days: stat.installDaysAgo
        })
      }
    } else if (stat.enabled && stat.lastEnableDaysAgo !== null) {
      if (stat.lastEnableDaysAgo >= UNUSED_DAYS_THRESHOLD) {
        disableCandidates.push({
          type: "disable",
          id: ext.id,
          name: stat.name,
          days: stat.lastEnableDaysAgo
        })
      }
    }
  }

  // 未用时间越长的越靠前，LLM 和用户都优先看到最明显的"闲置项"
  disableCandidates.sort((a, b) => b.days - a.days)
  reviewCandidates.sort((a, b) => b.days - a.days)

  return { extStats, candidates: [...disableCandidates, ...reviewCandidates] }
}
