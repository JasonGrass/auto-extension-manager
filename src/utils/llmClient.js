/**
 * OpenAI 兼容的 LLM 客户端（仅 chat/completions 一个接口）
 *
 * 为什么不用 SDK：项目里没有现成的 openai 依赖，而 chat/completions
 * 一个 fetch 就够，还避免了把整包 SDK 打进扩展产物。
 *
 * 错误约定：抛出的 Error 上带 code 属性，UI 层据此映射为 i18n 文案：
 * - NO_CONFIG  配置缺失或不完整
 * - TIMEOUT    请求超时
 * - NETWORK    网络错误（DNS、连接被拒等）
 * - HTTP_xxx   服务端返回非 2xx，message 里带响应体摘要
 * - BAD_JSON   模型返回的内容解析不出 JSON
 */

export const LLM_ERROR_CODE = {
  NO_CONFIG: "NO_CONFIG",
  TIMEOUT: "TIMEOUT",
  NETWORK: "NETWORK",
  BAD_JSON: "BAD_JSON",
  URL_INVALID: "URL_INVALID",
  ABORTED: "ABORTED"
}

export const DEFAULT_LLM_CONFIG = {
  baseURL: "https://api.deepseek.com",
  apiKey: "",
  model: "deepseek-chat"
}

/**
 * @param {config.ILlmConfig | null | undefined} config
 * @returns {boolean} 三项都非空才算有效
 */
export function isLlmConfigValid(config) {
  if (!config || typeof config !== "object") {
    return false
  }
  return (
    typeof config.baseURL === "string" &&
    config.baseURL.trim().length > 0 &&
    typeof config.apiKey === "string" &&
    config.apiKey.trim().length > 0 &&
    typeof config.model === "string" &&
    config.model.trim().length > 0
  )
}

/**
 * 拼接 chat/completions 完整地址。
 * baseURL 已含路径（如 https://xx.com/v1）时直接追加端点名，不额外补 /v1，
 * 因为各家兼容服务的路径约定不一，用户填什么就尊重什么。
 */
export function buildChatUrl(baseURL) {
  return `${baseURL.trim().replace(/\/+$/, "")}/chat/completions`
}

/**
 * 规范化 baseURL：没有协议时补 https://（最常见的填写错误，
 * 缺协议会被 fetch 当成相对地址而直接失败），并去掉结尾多余的斜杠。
 * 只修正协议和斜杠，保留用户写的路径（如 /v1）。
 *
 * @param {string} input
 * @returns {string | null} 规范化后的地址；无法解析或非 http/https 时返回 null
 */
export function normalizeBaseURL(input) {
  let candidate = String(input ?? "").trim()
  if (candidate.length === 0) {
    return null
  }

  // 没有 scheme 的地址（如 "api.deepseek.com"）默认按 https 处理
  if (!/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(candidate)) {
    candidate = `https://${candidate}`
  }

  let url
  try {
    url = new URL(candidate)
  } catch {
    return null
  }

  // 只允许 http/https，拦掉 ws://、file:// 等无效协议
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    return null
  }
  return url.origin + url.pathname.replace(/\/+$/, "")
}

/**
 * 根据 baseURL 生成 Chrome host 权限模式串（如 https://api.deepseek.com/*）。
 * MV3 扩展页面的跨域请求受 CORS 限制，需要 host 权限才能直连，
 * 模式串是申请 chrome.permissions 的输入。
 *
 * @param {string} baseURL
 * @returns {string | null}
 */
export function hostPatternFromBaseURL(baseURL) {
  const normalized = normalizeBaseURL(baseURL)
  if (normalized === null) {
    return null
  }
  return `${new URL(normalized).origin}/*`
}

/**
 * 宽松解析模型返回的 JSON。
 * 模型即使被要求输出纯 JSON，也常会包一层 ```json 围栏或带一句前言，
 * 所以先剥围栏，再截取第一个 {...} 或 [...] 块。
 *
 * @param {string} text
 * @returns {unknown} 解析后的对象
 * @throws {Error} code = BAD_JSON
 */
export function parseJsonLoose(text) {
  if (typeof text !== "string" || text.trim().length === 0) {
    throw llmError(LLM_ERROR_CODE.BAD_JSON, "empty response")
  }

  let candidate = text.trim()

  // 剥掉 markdown 代码围栏（```json ... ``` 或 ``` ... ```）
  const fenceMatch = candidate.match(/^```[a-zA-Z]*\s*([\s\S]*?)\s*```$/)
  if (fenceMatch) {
    candidate = fenceMatch[1].trim()
  }

  try {
    return JSON.parse(candidate)
  } catch {
    // 继续走截取逻辑
  }

  // 截取第一个平衡的 {...} 或 [...] 块（简单计数大括号，不处理字符串内的大括号，
  // 对 LLM 输出的场景够用且无歧义时优先取更长的匹配）
  for (const [open, close] of [
    ["{", "}"],
    ["[", "]"]
  ]) {
    const start = candidate.indexOf(open)
    if (start === -1) {
      continue
    }
    let depth = 0
    for (let end = start; end < candidate.length; end++) {
      const ch = candidate[end]
      if (ch === open) {
        depth++
      } else if (ch === close) {
        depth--
        if (depth === 0) {
          const slice = candidate.slice(start, end + 1)
          try {
            return JSON.parse(slice)
          } catch {
            // 该块解析失败，尝试另一种括号
          }
          break
        }
      }
    }
  }

  throw llmError(LLM_ERROR_CODE.BAD_JSON, `unparseable: ${text.slice(0, 120)}`)
}

/**
 * @param {string} code
 * @param {string} message
 * @returns {Error}
 */
function llmError(code, message) {
  const error = new Error(`[${code}] ${message}`)
  error.code = code
  return error
}

/** 从 Error 的 HTTP message 里截出一段可读的响应体摘要，避免整个 HTML 刷屏 */
function summarizeBody(body) {
  const text = String(body ?? "")
  if (text.length === 0) {
    return ""
  }
  return text.replace(/\s+/g, " ").slice(0, 200)
}

/**
 * LLM API 请求的公共骨架：规范化地址、鉴权头、超时与错误码映射。
 * chat/completions 和 models 两个端点共用。
 *
 * @param {config.ILlmConfig} config
 * @param {string} path
 * @param {object} init fetch 的 init（method/body 等）
 * @param {number} timeoutMs
 * @param {AbortSignal} [externalSignal] 外部取消信号（如用户点「停止分析」），
 *   与内部超时信号并联，任一触发都会中止请求
 */
async function llmRequest(config, path, init, timeoutMs, externalSignal) {
  // 防御性规范化：即使用户绕过设置页直接改了存储，也不至于发出无效请求
  const normalizedBaseURL = normalizeBaseURL(config.baseURL)
  if (normalizedBaseURL === null) {
    throw llmError(LLM_ERROR_CODE.URL_INVALID, `invalid baseURL: ${config.baseURL}`)
  }

  // 内部超时与外部取消共用一个 controller，不直接用 externalSignal 是因为
  // 超时定时器也需要同一个中止源，且 AbortSignal.any 的兼容面更窄
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  const onExternalAbort = () => controller.abort()
  if (externalSignal) {
    if (externalSignal.aborted) {
      controller.abort()
    } else {
      externalSignal.addEventListener("abort", onExternalAbort)
    }
  }

  let response
  try {
    console.debug(`[LLM] ${init.method ?? "GET"} ${normalizedBaseURL}${path}`)
    response = await fetch(`${normalizedBaseURL}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey.trim()}`,
        ...init.headers
      },
      signal: controller.signal
    })
  } catch (error) {
    if (error?.name === "AbortError") {
      if (externalSignal?.aborted) {
        throw llmError(LLM_ERROR_CODE.ABORTED, "aborted by user")
      }
      throw llmError(LLM_ERROR_CODE.TIMEOUT, `timeout after ${timeoutMs}ms`)
    }
    // 网络层就挂了（被 CORS 拦、DNS 失败等），打出来方便在控制台定位
    console.warn(`[LLM] 请求失败 ${normalizedBaseURL}${path}:`, error)
    throw llmError(LLM_ERROR_CODE.NETWORK, String(error?.message ?? error))
  } finally {
    clearTimeout(timer)
    if (externalSignal) {
      externalSignal.removeEventListener("abort", onExternalAbort)
    }
  }

  if (!response.ok) {
    const bodyText = await response.text().catch(() => "")
    console.warn(
      `[LLM] HTTP ${response.status} ${normalizedBaseURL}${path}:`,
      bodyText.slice(0, 300)
    )
    const error = llmError(`HTTP_${response.status}`, summarizeBody(bodyText))
    error.status = response.status
    throw error
  }
  return response
}

/**
 * 发起一次 chat/completions 请求并返回首个回复文本
 *
 * @param {Array<{role: string, content: string}>} messages
 * @param {config.ILlmConfig} config
 * @param {{jsonMode?: boolean, timeoutMs?: number, temperature?: number, signal?: AbortSignal}} [options]
 * @returns {Promise<string>}
 * @throws {Error} 带 code 属性
 */
export async function chatCompletion(messages, config, options = {}) {
  const { jsonMode = false, timeoutMs = 30000, temperature, signal } = options

  if (!isLlmConfigValid(config)) {
    throw llmError(LLM_ERROR_CODE.NO_CONFIG, "llm config is missing or incomplete")
  }

  const body = {
    model: config.model,
    messages,
    stream: false,
    ...(typeof temperature === "number" ? { temperature } : {}),
    // JSON 模式是可选能力，部分 OpenAI 兼容服务不支持该参数，由 chatJson 负责降级
    ...(jsonMode ? { response_format: { type: "json_object" } } : {})
  }

  const response = await llmRequest(
    config,
    "/chat/completions",
    { method: "POST", body: JSON.stringify(body) },
    timeoutMs,
    signal
  )

  const data = await response.json().catch(() => {
    throw llmError(LLM_ERROR_CODE.BAD_JSON, "response body is not json")
  })

  const content = data?.choices?.[0]?.message?.content
  if (typeof content !== "string") {
    // 有些推理模型会把内容放在 reasoning_content，content 为空，打出完整响应体方便定位
    console.warn("[LLM] 响应里没有 choices[0].message.content:", data)
    throw llmError(LLM_ERROR_CODE.BAD_JSON, "no choices[0].message.content in response")
  }
  // 原始返回只在控制台输出，方便排查模型不按格式回答的问题
  console.debug(`[LLM] 模型返回(${content.length} 字符):`, content.slice(0, 500))
  return content
}

/**
 * 获取服务端可用的模型 ID 列表（OpenAI 兼容的 GET /models）。
 * 各家模型的 API ID 与产品名没有对应关系（把产品名当 ID 几乎必 404），
 * 拉列表让用户直接选是最可靠的方式。
 *
 * @param {config.ILlmConfig} config
 * @param {{timeoutMs?: number}} [options]
 * @returns {Promise<string[]>} 模型 ID 列表
 */
export async function listModels(config, options = {}) {
  const { timeoutMs = 20000 } = options

  if (!isLlmConfigValid(config)) {
    throw llmError(LLM_ERROR_CODE.NO_CONFIG, "llm config is missing or incomplete")
  }

  const response = await llmRequest(config, "/models", { method: "GET" }, timeoutMs)

  const data = await response.json().catch(() => {
    throw llmError(LLM_ERROR_CODE.BAD_JSON, "response body is not json")
  })

  const list = Array.isArray(data?.data) ? data.data : []
  return list.map((item) => item?.id).filter((id) => typeof id === "string" && id.length > 0)
}

/**
 * 要一份 JSON 回复：优先带 response_format 请求，服务端拒绝（400）时
 * 去掉该参数重试一次，再靠 parseJsonLoose 兜底。
 *
 * @param {Array<{role: string, content: string}>} messages
 * @param {config.ILlmConfig} config
 * @param {{timeoutMs?: number, temperature?: number, signal?: AbortSignal}} [options]
 * @returns {Promise<unknown>}
 */
export async function chatJson(messages, config, options = {}) {
  try {
    const content = await chatCompletion(messages, config, { ...options, jsonMode: true })
    return parseJsonLoose(content)
  } catch (error) {
    // 仅当「带 jsonMode 的请求被服务端以 4xx 拒绝」时才值得重试；
    // 超时/网络/配置错误重试没有意义
    const retriable = typeof error?.code === "string" && error.code.startsWith("HTTP_4")
    if (!retriable) {
      throw error
    }
  }

  const content = await chatCompletion(messages, config, { ...options, jsonMode: false })
  return parseJsonLoose(content)
}
