import assert from "node:assert/strict"
import test from "node:test"

import {
  BATCH_SIZE,
  MIN_PER_GROUP,
  buildGroupMessages,
  buildMergeCheckMessages,
  validateGroupSuggestions,
  validateMergeSuggestions
} from "../src/pages/Options/group/aiGroupPrompt.js"

const EXTENSIONS = [
  { id: "ext-1", name: "Alpha", description: "ad blocker" },
  { id: "ext-2", name: "Beta", description: "todo list" },
  { id: "ext-3", name: "Gamma", description: "" }
]

// 多数用例聚焦于 id 解析/去重/过滤逻辑，建议里只有一两个成员，
// 显式放宽最小组员数以保持测试焦点；minPerGroup 本身有专门用例
const LOOSE = { minPerGroup: 1 }

test("buildGroupMessages numbers extensions instead of exposing long ids", () => {
  const { messages, idByNo } = buildGroupMessages(EXTENSIONS, ["已有组"], "zh-CN")

  assert.equal(messages.length, 2)
  assert.equal(messages[0].role, "system")
  assert.equal(messages[1].role, "user")

  const user = JSON.parse(messages[1].content)
  assert.deepEqual(user.existingGroups, ["已有组"])
  assert.equal(user.extensions.length, 3)
  // 模型只看到短编号，看不到 32 位长 id（输出长度是超时的主因）
  assert.equal(user.extensions[0].no, "1")
  assert.equal(user.extensions[0].id, undefined)
  assert.equal(idByNo.get("1"), "ext-1")
  assert.equal(idByNo.get("3"), "ext-3")
})

test("buildGroupMessages truncates long descriptions", () => {
  const long = { id: "e", name: "N", description: "x".repeat(500) }
  const { messages } = buildGroupMessages([long], [], "en")
  const user = JSON.parse(messages[1].content)
  assert.equal(user.extensions[0].description.length, 300)
})

test("buildGroupMessages budgets new groups against the 12-group limit", () => {
  // 已有 11 个分组时，总上限 12，但保底允许新建 3 个，避免模型不敢建组
  const eleven = Array.from({ length: 11 }, (_, i) => `组${i}`)
  const system = buildGroupMessages(EXTENSIONS, eleven, "zh-CN").messages[0].content
  assert.match(system, /已有 11 个分组/)
  assert.match(system, /本次新建分组通常不超过 3 个/)

  // 已有 1 个分组时，预算是 12 - 1 = 11 个
  const systemFew = buildGroupMessages(EXTENSIONS, ["已有组"], "zh-CN").messages[0].content
  assert.match(systemFew, /本次新建分组通常不超过 11 个/)

  // 无法判断的扩展应跳过而不是归入「其他」；碎组规则写入提示词
  assert.doesNotMatch(system, /其他/)
  assert.match(systemFew, /直接跳过/)
  assert.match(systemFew, new RegExp(`至少要有 ${MIN_PER_GROUP} 个扩展`))
})

test("validateGroupSuggestions filters tiny groups by default", () => {
  // 默认 minPerGroup = 8：一两个扩展就建组会产生"碎组"，直接过滤
  const eight = Array.from({ length: 8 }, (_, i) => ({ id: `e${i}`, name: `E${i}` }))
  const parsed = {
    suggestions: [
      { name: "碎组", nos: ["1"] },
      { name: "正常组", nos: ["1", "2", "3", "4", "5", "6", "7", "8"] }
    ]
  }
  const { idByNo } = buildGroupMessages(eight, [], "zh-CN")
  const result = validateGroupSuggestions(parsed, { extensions: eight, idByNo })

  assert.deepEqual(
    result.suggestions.map((s) => s.name),
    ["正常组"]
  )
  assert.equal(result.suggestions[0].extensionIds.length, 8)
})

test("validateGroupSuggestions keeps groups that reach min size after merging", () => {
  // 同名建议合并后凑够最小组员数的组仍然有效
  const eight = Array.from({ length: 8 }, (_, i) => ({ id: `e${i}`, name: `E${i}` }))
  const parsed = {
    suggestions: [
      { name: "工具", nos: ["1", "2", "3"] },
      { name: "工具", nos: ["4", "5", "6", "7", "8"] }
    ]
  }
  const { idByNo } = buildGroupMessages(eight, [], "zh-CN")
  const result = validateGroupSuggestions(parsed, { extensions: eight, idByNo })

  assert.equal(result.suggestions.length, 1)
  assert.equal(result.suggestions[0].extensionIds.length, 8)
})

test("validateGroupSuggestions drops hallucinated ids and keeps real ones", () => {
  const parsed = {
    suggestions: [{ name: "开发", desc: "dev tools", extensionIds: ["ext-1", "fake-id", "ext-1"] }]
  }
  const result = validateGroupSuggestions(parsed, {
    extensions: EXTENSIONS,
    existingGroupNames: [],
    ...LOOSE
  })

  assert.equal(result.suggestions.length, 1)
  assert.equal(result.rawCount, 1)
  assert.deepEqual(result.suggestions[0].extensionIds, ["ext-1"])
})

test("validateGroupSuggestions accepts groups key and top-level array", () => {
  const byGroupsKey = {
    groups: [{ name: "A", extensionIds: ["ext-1"] }]
  }
  assert.deepEqual(
    validateGroupSuggestions(byGroupsKey, { extensions: EXTENSIONS, ...LOOSE }).suggestions.map(
      (s) => s.name
    ),
    ["A"]
  )

  const topLevelArray = [{ name: "B", extensionIds: ["ext-2"] }]
  assert.deepEqual(
    validateGroupSuggestions(topLevelArray, { extensions: EXTENSIONS, ...LOOSE }).suggestions.map(
      (s) => s.name
    ),
    ["B"]
  )
})

test("validateGroupSuggestions maps extension names back to ids", () => {
  // 模型把扩展名称写进 extensionIds 时，按名称回查，而不是当成幻觉全部丢弃
  const parsed = {
    suggestions: [{ name: "开发", extensionIds: ["Alpha", "beta", "fake"] }]
  }
  const result = validateGroupSuggestions(parsed, { extensions: EXTENSIONS, ...LOOSE })

  assert.deepEqual(result.suggestions[0].extensionIds, ["ext-1", "ext-2"])
})

test("validateGroupSuggestions drops empty or nameless groups", () => {
  const parsed = {
    suggestions: [
      { name: "空组", extensionIds: [] },
      { name: "  ", extensionIds: ["ext-1"] },
      { name: "有效组", extensionIds: ["ext-2"] }
    ]
  }
  const result = validateGroupSuggestions(parsed, {
    extensions: EXTENSIONS,
    existingGroupNames: [],
    ...LOOSE
  })
  assert.deepEqual(
    result.suggestions.map((s) => s.name),
    ["有效组"]
  )
  // rawCount 保留模型给出的原始条数，便于上层区分「没给建议」和「全被过滤」
  assert.equal(result.rawCount, 3)
})

test("validateGroupSuggestions moves name-conflicting suggestions to merges", () => {
  // 与现有分组同名的建议不再丢弃：这些扩展需要并入现有组才能归类
  const parsed = {
    suggestions: [
      { name: "已有组", extensionIds: ["ext-1"] },
      { name: "新组", extensionIds: ["ext-2"] }
    ]
  }
  const result = validateGroupSuggestions(parsed, {
    extensions: EXTENSIONS,
    existingGroupNames: ["已有组"],
    ...LOOSE
  })
  assert.deepEqual(
    result.suggestions.map((s) => s.name),
    ["新组"]
  )
  assert.equal(result.merges.length, 1)
  assert.equal(result.merges[0].name, "已有组")
  assert.deepEqual(result.merges[0].extensionIds, ["ext-1"])
})

test("validateGroupSuggestions merges duplicate names within one batch", () => {
  // 模型在同一批里给了两个同名建议（如两个「其他」），并成一组
  const parsed = {
    suggestions: [
      { name: "其他", extensionIds: ["ext-1"] },
      { name: "其他", extensionIds: ["ext-2"] }
    ]
  }
  const result = validateGroupSuggestions(parsed, { extensions: EXTENSIONS, ...LOOSE })

  assert.equal(result.suggestions.length, 1)
  assert.deepEqual(result.suggestions[0].extensionIds, ["ext-1", "ext-2"])
})

test("validateGroupSuggestions dedupes suggestion names and caps group count", () => {
  const parsed = {
    suggestions: [
      { name: "A", extensionIds: ["ext-1"] },
      { name: "a", extensionIds: ["ext-2"] },
      { name: "B", extensionIds: ["ext-3"] },
      { name: "C", extensionIds: ["ext-1"] }
    ]
  }
  const result = validateGroupSuggestions(parsed, {
    extensions: EXTENSIONS,
    existingGroupNames: [],
    maxGroups: 2,
    ...LOOSE
  })
  assert.deepEqual(
    result.suggestions.map((s) => s.name),
    ["A", "B"]
  )
})

test("validateGroupSuggestions truncates name and desc, caps per-group ids", () => {
  // 3 个真实 id 各重复多次，验证去重发生在截断之前
  const manyIds = Array.from({ length: 50 }, (_, i) => `ext-${(i % 3) + 1}`)
  const parsed = {
    suggestions: [{ name: "N".repeat(50), desc: "D".repeat(200), extensionIds: manyIds }]
  }
  const result = validateGroupSuggestions(parsed, {
    extensions: EXTENSIONS,
    existingGroupNames: [],
    maxPerGroup: 2,
    ...LOOSE
  })

  assert.equal(result.suggestions[0].name.length, 8)
  assert.equal(result.suggestions[0].desc.length, 60)
  assert.equal(result.suggestions[0].extensionIds.length, 2)
})

test("validateGroupSuggestions resolves short numbers back to real ids", () => {
  // 标准路径：模型按提示词要求输出 nos 编号数组
  const { idByNo } = buildGroupMessages(EXTENSIONS, [], "zh-CN")
  const parsed = {
    suggestions: [{ name: "开发", nos: ["1", 2] }]
  }
  const result = validateGroupSuggestions(parsed, {
    extensions: EXTENSIONS,
    idByNo,
    ...LOOSE
  })

  // "1" 和数字 2 都要能解析；幻觉编号 "9" 被丢弃
  const fake = validateGroupSuggestions(
    { suggestions: [{ name: "开发", nos: ["1", "9"] }] },
    { extensions: EXTENSIONS, idByNo, ...LOOSE }
  )
  assert.deepEqual(result.suggestions[0].extensionIds, ["ext-1", "ext-2"])
  assert.deepEqual(fake.suggestions[0].extensionIds, ["ext-1"])
})

test("validateGroupSuggestions tolerates garbage input", () => {
  assert.deepEqual(validateGroupSuggestions(null, { extensions: EXTENSIONS }), {
    suggestions: [],
    merges: [],
    rawCount: 0
  })
  assert.deepEqual(validateGroupSuggestions({}, { extensions: EXTENSIONS }), {
    suggestions: [],
    merges: [],
    rawCount: 0
  })
  assert.deepEqual(validateGroupSuggestions({ suggestions: "nope" }, { extensions: EXTENSIONS }), {
    suggestions: [],
    merges: [],
    rawCount: 0
  })
})

test("buildGroupMessages supports retry mode and permission enrichment", () => {
  const ext = {
    id: "ext-9",
    name: "Mystery",
    description: "",
    permissions: ["tabs", "storage", "declarativeNetRequest"],
    hostPermissions: ["<all_urls>"]
  }

  const retry = buildGroupMessages([ext], [], "zh-CN", { retry: true }).messages[0].content
  assert.match(retry, /上一轮未能归类/)

  const withPerms = buildGroupMessages([ext], [], "zh-CN", { includePermissions: true })
  const user = JSON.parse(withPerms.messages[1].content)
  assert.deepEqual(user.extensions[0].permissions, ["tabs", "storage", "declarativeNetRequest"])
  assert.deepEqual(user.extensions[0].hosts, ["<all_urls>"])

  // 默认不带权限字段，控制请求体积
  const plain = JSON.parse(buildGroupMessages([ext], [], "zh-CN").messages[1].content)
  assert.equal(plain.extensions[0].permissions, undefined)
})

test("BATCH_SIZE caps a single analysis batch", () => {
  assert.equal(typeof BATCH_SIZE, "number")
  assert.equal(BATCH_SIZE, 50)
})

test("buildMergeCheckMessages asks for redundant group pairs", () => {
  const messages = buildMergeCheckMessages(["AI助手", "AI对话", "翻译"], "zh-CN")

  assert.equal(messages.length, 2)
  assert.match(messages[0].content, /语义重复或高度相近/)
  const user = JSON.parse(messages[1].content)
  assert.deepEqual(user.groupNames, ["AI助手", "AI对话", "翻译"])
})

test("validateMergeSuggestions keeps only real, non-self, unique pairs", () => {
  const names = ["AI助手", "AI对话", "翻译"]
  const parsed = {
    merges: [
      { from: "AI对话", to: "AI助手" },
      { from: "AI对话", to: "翻译" }, // 同一 from 只保留第一条
      { from: "不存在的组", to: "翻译" }, // 幻觉组名
      { from: "翻译", to: "翻译" }, // 自己合并自己
      { from: "翻译", to: "AI助手" }
    ]
  }
  const result = validateMergeSuggestions(parsed, names)

  assert.deepEqual(result, [
    { from: "AI对话", to: "AI助手" },
    { from: "翻译", to: "AI助手" }
  ])

  assert.deepEqual(validateMergeSuggestions(null, names), [])
  assert.deepEqual(validateMergeSuggestions({}, names), [])
})

test("preset mode locks group names and forbids invented ones", () => {
  // 预设模式：提示词里列出预设组并禁止发明新组名
  const { messages } = buildGroupMessages(EXTENSIONS, [], "zh-CN", {
    presetGroups: ["翻译", "开发工具"]
  })
  assert.match(messages[0].content, /必须严格使用以下预设分组/)
  assert.match(messages[0].content, /翻译、开发工具/)
  assert.doesNotMatch(messages[0].content, /desc 用一句话/)

  const user = JSON.parse(messages[1].content)
  assert.deepEqual(user.existingGroups, ["翻译", "开发工具"])
})

test("validateGroupSuggestions enforces the allowedNames whitelist", () => {
  // 预设模式：模型自作主张输出的名单外组名（如「其他」）直接丢弃
  const parsed = {
    suggestions: [
      { name: "翻译", extensionIds: ["ext-1"] },
      { name: "其他", extensionIds: ["ext-2"] }
    ]
  }
  const result = validateGroupSuggestions(parsed, {
    extensions: EXTENSIONS,
    allowedNames: ["翻译", "开发工具"],
    minPerGroup: 1
  })

  assert.deepEqual(
    result.suggestions.map((s) => s.name),
    ["翻译"]
  )
  assert.deepEqual(result.suggestions[0].extensionIds, ["ext-1"])
})
