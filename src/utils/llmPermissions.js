/**
 * LLM 服务的 host 权限管理。
 *
 * 为什么需要：MV3 中扩展页面（options/popup）的跨域 fetch 和普通网页一样
 * 受 CORS 约束，而多数 LLM 服务并不返回允许扩展来源的 CORS 头，
 * 请求会被浏览器直接拦下（表现为 fetch 抛 "Failed to fetch"，即用户看到的
 * 「网络错误」）。解法是在 manifest 里声明 optional_host_permissions，
 * 在用户保存配置时对具体来源申请权限——授予权限后 Chrome 会豁免该来源的
 * CORS 校验，请求才能真正发出去。
 *
 * 用可选权限而不是 all_urls：把权限范围限制在用户自己填写的 API 地址上，
 * 保持扩展整体的权限克制。
 */

import { hostPatternFromBaseURL } from "./llmClient"

/**
 * 包装 chrome.permissions 的回调风格 API
 */
function callPermissions(method, args) {
  return new Promise((resolve, reject) => {
    try {
      chrome.permissions[method](args, (result) => {
        const lastError = chrome.runtime.lastError
        if (lastError) {
          reject(new Error(lastError.message))
        } else {
          resolve(result)
        }
      })
    } catch (error) {
      reject(error)
    }
  })
}

/**
 * 确保已持有访问该 API 地址的 host 权限；没有则发起授权弹窗。
 * 注意：request 需要在用户手势（点击）的调用链上发起。
 *
 * @param {string} baseURL
 * @returns {Promise<boolean>} 是否已授权（含已授权过的情况）
 * @throws {Error} code = URL_INVALID 时表示地址无法解析
 */
export async function ensureHostPermission(baseURL) {
  const pattern = hostPatternFromBaseURL(baseURL)
  if (pattern === null) {
    const error = new Error("invalid baseURL for permission pattern")
    error.code = "URL_INVALID"
    throw error
  }

  const already = await callPermissions("contains", { origins: [pattern] })
  if (already) {
    return true
  }

  try {
    return await callPermissions("request", { origins: [pattern] })
  } catch {
    // 多为「没有用户手势」导致的失败，按未授权处理，由调用方提示
    return false
  }
}
