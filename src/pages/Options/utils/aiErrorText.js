import { getLang } from ".../utils/utils"

/**
 * 把 llmClient 抛出的带 code 错误翻译成用户可读的文案。
 * 放在 Options 页面层而不是 llmClient 里，是因为 utils 层不应该依赖 chrome.i18n。
 *
 * NETWORK/HTTP 类错误会把底层信息附在括号里（如 "Failed to fetch"），
 * 方便用户截图反馈时能定位到真实原因，而不是只剩一句笼统的「网络错误」。
 *
 * @param {Error} error
 * @returns {string}
 */
export function llmErrorText(error) {
  const code = String(error?.code ?? "")
  const detail = String(error?.message ?? "")
    .replace(/^\[[A-Z_0-9]+\]\s*/, "") // 去掉我们自己拼的 "[CODE] " 前缀
    .slice(0, 120)

  if (code === "NO_CONFIG") {
    return getLang("ai_error_no_config")
  }
  if (code === "URL_INVALID") {
    return getLang("ai_error_url_invalid")
  }
  if (code === "TIMEOUT") {
    return getLang("ai_error_timeout")
  }
  if (code === "NETWORK") {
    return detail ? `${getLang("ai_error_network")} (${detail})` : getLang("ai_error_network")
  }
  if (code === "BAD_JSON") {
    return getLang("ai_error_bad_json")
  }
  if (code.startsWith("HTTP_")) {
    const status = code.slice("HTTP_".length)
    const text = `${getLang("ai_error_http")} (HTTP ${status})`
    return detail ? `${text} ${detail}` : text
  }
  return getLang("ai_error_unknown")
}
