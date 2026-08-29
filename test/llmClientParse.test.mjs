import assert from "node:assert/strict"
import test from "node:test"

import {
  buildChatUrl,
  chatCompletion,
  hostPatternFromBaseURL,
  isLlmConfigValid,
  normalizeBaseURL,
  parseJsonLoose,
  LLM_ERROR_CODE
} from "../src/utils/llmClient.js"

test("isLlmConfigValid requires all three fields", () => {
  assert.equal(isLlmConfigValid(null), false)
  assert.equal(isLlmConfigValid({ baseURL: "", apiKey: "k", model: "m" }), false)
  assert.equal(isLlmConfigValid({ baseURL: "u", apiKey: "  ", model: "m" }), false)
  assert.equal(isLlmConfigValid({ baseURL: "u", apiKey: "k", model: "" }), false)
  assert.equal(isLlmConfigValid({ baseURL: "u", apiKey: "k", model: "m" }), true)
})

test("buildChatUrl joins base url and endpoint", () => {
  assert.equal(buildChatUrl("https://api.x.com"), "https://api.x.com/chat/completions")
  assert.equal(buildChatUrl("https://api.x.com/"), "https://api.x.com/chat/completions")
  assert.equal(buildChatUrl(" https://api.x.com/v1 "), "https://api.x.com/v1/chat/completions")
})

test("parseJsonLoose handles plain json", () => {
  assert.deepEqual(parseJsonLoose('{"a":1}'), { a: 1 })
  assert.deepEqual(parseJsonLoose("  [1,2]  "), [1, 2])
})

test("parseJsonLoose strips markdown fences", () => {
  assert.deepEqual(parseJsonLoose('```json\n{"a":1}\n```'), { a: 1 })
  assert.deepEqual(parseJsonLoose('```\n{"a":1}\n```'), { a: 1 })
})

test("parseJsonLoose extracts json from surrounding text", () => {
  assert.deepEqual(parseJsonLoose('好的，以下是结果：{"a":1} 请查收'), { a: 1 })
})

test("parseJsonLoose throws BAD_JSON on garbage", () => {
  assert.throws(
    () => parseJsonLoose("no json here"),
    (e) => e.code === LLM_ERROR_CODE.BAD_JSON
  )
  assert.throws(
    () => parseJsonLoose(""),
    (e) => e.code === LLM_ERROR_CODE.BAD_JSON
  )
})

test("normalizeBaseURL prepends https when scheme missing", () => {
  // 用户最常犯的错误：没写协议头，fetch 会当成相对地址直接失败
  assert.equal(normalizeBaseURL("api.deepseek.com"), "https://api.deepseek.com")
  assert.equal(normalizeBaseURL("  api.deepseek.com  "), "https://api.deepseek.com")
})

test("normalizeBaseURL keeps path and strips trailing slashes", () => {
  assert.equal(normalizeBaseURL("https://api.x.com/v1/"), "https://api.x.com/v1")
  assert.equal(normalizeBaseURL("https://api.x.com"), "https://api.x.com")
  assert.equal(normalizeBaseURL("http://localhost:11434"), "http://localhost:11434")
})

test("normalizeBaseURL rejects invalid input", () => {
  assert.equal(normalizeBaseURL(""), null)
  assert.equal(normalizeBaseURL("not a url:"), null)
  assert.equal(normalizeBaseURL("ftp://files.example.com"), null)
})

test("hostPatternFromBaseURL builds permission pattern", () => {
  assert.equal(hostPatternFromBaseURL("https://api.deepseek.com"), "https://api.deepseek.com/*")
  assert.equal(hostPatternFromBaseURL("api.deepseek.com/v1"), "https://api.deepseek.com/*")
  assert.equal(hostPatternFromBaseURL("http://localhost:11434"), "http://localhost:11434/*")
  assert.equal(hostPatternFromBaseURL("::bad url"), null)
})

test("chatCompletion maps external abort to ABORTED and timeout to TIMEOUT", async () => {
  // mock fetch：监听传入的 signal，中止时抛出浏览器同款 AbortError
  const hangingFetch = (url, init) =>
    new Promise((resolve, reject) => {
      init.signal.addEventListener("abort", () => {
        const error = new Error("The operation was aborted")
        error.name = "AbortError"
        reject(error)
      })
    })
  const originalFetch = globalThis.fetch
  globalThis.fetch = hangingFetch

  const config = { baseURL: "https://api.test.com", apiKey: "k", model: "m" }
  const messages = [{ role: "user", content: "ping" }]
  try {
    // 外部取消 → ABORTED
    const controller = new AbortController()
    const aborted = chatCompletion(messages, config, { signal: controller.signal, timeoutMs: 5000 })
    setTimeout(() => controller.abort(), 10)
    await assert.rejects(aborted, (e) => e.code === LLM_ERROR_CODE.ABORTED)

    // 无外部取消、超时触发 → TIMEOUT
    const timedOut = chatCompletion(messages, config, { timeoutMs: 30 })
    await assert.rejects(timedOut, (e) => e.code === LLM_ERROR_CODE.TIMEOUT)
  } finally {
    globalThis.fetch = originalFetch
  }
})

test("validateImportedSnapshot accepts only well-formed group snapshots", async () => {
  const { validateImportedSnapshot } = await import("../src/storage/local/GroupSnapshotStorage.js")

  const good = {
    type: "group-snapshot",
    version: 1,
    name: "我的整理",
    groups: [
      { id: "fixed", name: "固定分组", extensions: [] },
      { id: "abc", name: "翻译", extensions: ["ext-1", "ext-2"] }
    ]
  }
  const valid = validateImportedSnapshot(good)
  assert.equal(valid.name, "我的整理")
  assert.equal(valid.groups.length, 2)

  assert.equal(validateImportedSnapshot(null), null)
  assert.equal(validateImportedSnapshot({ type: "other" }), null)
  assert.equal(validateImportedSnapshot({ type: "group-snapshot", groups: [] }), null)
  assert.equal(
    validateImportedSnapshot({
      type: "group-snapshot",
      groups: [{ name: "no id", extensions: [] }]
    }),
    null
  )
  assert.equal(
    validateImportedSnapshot({ type: "group-snapshot", groups: [{ id: "a", extensions: [] }] }),
    null
  )
})
