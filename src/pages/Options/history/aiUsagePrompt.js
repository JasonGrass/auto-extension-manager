/**
 * 「AI 减负分析」的提示词构建与返回校验（纯函数，便于单测）
 */

const SUMMARY_MAX_LEN = 300
const REASON_MAX_LEN = 120
const MAX_SUGGESTIONS = 10

const VALID_TYPES = new Set(["disable", "uninstall", "review"])

/**
 * @param {Array} extStats buildUsageStats 返回的 extStats
 * @param {Array} candidates buildUsageStats 返回的 candidates
 * @param {string} uiLanguage 例如 "zh-CN"
 * @returns {Array<{role: string, content: string}>}
 */
export function buildUsageMessages(extStats, candidates, uiLanguage) {
  const system = [
    "你是浏览器扩展使用分析助手。输入数据包含：",
    "- extStats：每个扩展的当前启用状态、被启用的次数、距上次启用的天数、距安装的天数",
    "- candidates：代码按规则预筛出的候选（type=disable 长期未用，type=review 装了很久从未用过）",
    "任务：归纳整体使用情况，并给出「减负」建议，帮用户减少扩展数量带来的负担。",
    "建议类型：",
    "- disable：长期未用但当前启用的扩展，建议禁用（可逆、安全）",
    "- uninstall：基本无用甚至多余的扩展，建议卸载（谨慎给出，要有充分理由）",
    "- review：需要用户自行判断的情况（如从未用过的新扩展）",
    "要求：",
    "1. extensionIds 只能使用输入数据中出现的扩展 id",
    "2. 优先基于 candidates 归纳，也欢迎从 extStats 中发现其他模式（例如数量异常多的同类扩展）",
    `3. summary 一段话（不超过 ${SUMMARY_MAX_LEN} 字），每条建议的 reason 一句话（不超过 ${REASON_MAX_LEN} 字）`,
    '4. 输出严格的 JSON：{"summary":"...","suggestions":[{"type":"disable","extensionIds":["id"],"reason":"..."}]}，不要输出 JSON 以外的任何文字',
    `5. 使用 ${uiLanguage} 回复`
  ].join("\n")

  const user = JSON.stringify({ extStats, candidates })

  return [
    { role: "system", content: system },
    { role: "user", content: user }
  ]
}

/**
 * 校验并清洗 LLM 返回的减负建议
 *
 * @param {unknown} parsed chatJson 的返回值
 * @param {{validIds: string[]}} ctx
 * @returns {{summary: string, suggestions: Array<{type: string, extensionIds: string[], reason: string}>}}
 */
export function validateUsageSuggestions(parsed, ctx) {
  const { validIds = [] } = ctx ?? {}
  const realIds = new Set(validIds)

  const summary = String(parsed?.summary ?? "")
    .trim()
    .slice(0, SUMMARY_MAX_LEN)
  const raw = Array.isArray(parsed?.suggestions) ? parsed.suggestions : []

  const suggestions = []
  for (const item of raw) {
    if (!item || typeof item !== "object") {
      continue
    }

    // type 不在白名单时降级为 review，而不是丢弃，尽量保留模型的意图
    const type = VALID_TYPES.has(item.type) ? item.type : "review"

    const ids = [...new Set(Array.isArray(item.extensionIds) ? item.extensionIds : [])].filter(
      (id) => typeof id === "string" && realIds.has(id)
    )

    if (ids.length === 0) {
      continue
    }

    suggestions.push({
      type,
      extensionIds: ids,
      reason: String(item.reason ?? "")
        .trim()
        .slice(0, REASON_MAX_LEN)
    })

    if (suggestions.length >= MAX_SUGGESTIONS) {
      break
    }
  }

  return { summary, suggestions }
}
