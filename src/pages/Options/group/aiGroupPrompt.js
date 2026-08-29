/**
 * 「AI 分组建议」的提示词构建与返回校验（纯函数，便于单测）
 *
 * 校验的目的：LLM 可能幻觉出不存在的扩展 id、或建议与现有分组重名的组，
 * 一律过滤掉，绝不让幻觉数据进入 storage。
 *
 * 对模型常见的输出偏差做有限兼容（不同 OpenAI 兼容服务的行为不一致）：
 * - 顶层直接是数组，或包在 groups 键下
 * - extensionIds 里写的是扩展名称而非 id（按名称回查 id）
 * 兼容失败的内容仍会被过滤，但调用方会拿到 rawCount 用于诊断提示。
 */

const NAME_MAX_LEN = 8
const DESC_MAX_LEN = 60
// 描述放宽到 300 字：描述里通常写明了扩展的用途，
// 是模型判断陌生扩展归属的主要依据，截太短会直接影响分类质量
const SOURCE_DESC_MAX_LEN = 300
// 分批分析：单批扩展数量。超过 ~50 个后模型对清单中后段的注意力明显下降
// （lost in the middle），大集合必须切片逐批分析
export const BATCH_SIZE = 50
// 单组最小组员数：一两个扩展就建组会产生大量"碎组"，污染分组列表。
// 不足该数的建议直接不建组，扩展留在未分类由用户手动处理
export const MIN_PER_GROUP = 8

/**
 * 预设分组框架（自由分组模式产生的组名不稳定、粒度失控，
 * 改为固定 12 类，AI 只做"把扩展分配到预设组"）。
 * 修改这份名单即可调整分类体系，UI 与校验自动跟随。
 */
export const PRESET_GROUP_NAMES = [
  "AI 对话",
  "AI 工具",
  "翻译",
  "广告拦截",
  "标签管理",
  "网页保存",
  "下载工具",
  "效率增强",
  "隐私安全",
  "影音媒体",
  "购物比价",
  "开发工具"
]

/**
 * 构建分组建议的提示词。
 *
 * 两种模式：
 * - 预设模式（options.presetGroups 传入组名数组）：AI 只能把扩展分配到预设分组，
 *   组名白名单校验，不再自由发挥——组名跨批稳定、粒度可控，是当前的默认方式
 * - 自由模式（不传 presetGroups）：模型自行设计分组名，历史行为
 *
 * 性能关键点：扩展的真实 id 是 32 位随机串，让模型在输出里逐个"抄写"
 * 这些长 id 是响应超时的主因。这里给每个扩展编短号（1、2、3…），
 * 模型只输出编号，调用方再用返回的 idByNo 映射回真实 id——
 * 输出 token 减少 90% 以上，生成时间大幅缩短。
 *
 * @param {Array<{id: string, name: string, description?: string}>} extensions
 * @param {string[]} existingGroupNames
 * @param {string} uiLanguage 例如 "zh-CN"，提示模型用该语言回复
 * @param {{retry?: boolean, includePermissions?: boolean, presetGroups?: string[]}} [options]
 *   retry: 批内重试模式——针对上一轮未能归类的难题用更明确的措辞再攻一次
 *   includePermissions: 附加权限列表，帮助识别没有描述的扩展
 *   presetGroups: 预设分组名单，传入即进入预设模式
 * @returns {{messages: Array<{role: string, content: string}>, idByNo: Map<string, string>}}
 */
export function buildGroupMessages(extensions, existingGroupNames, uiLanguage, options = {}) {
  const { retry = false, includePermissions = false, presetGroups } = options
  const presetMode = Array.isArray(presetGroups) && presetGroups.length > 0

  const idByNo = new Map()
  const numbered = (extensions ?? []).map((ext, index) => {
    const no = String(index + 1)
    idByNo.set(no, ext.id)
    const item = {
      no,
      name: ext.name ?? ext.id,
      description: String(ext.description ?? "").slice(0, SOURCE_DESC_MAX_LEN)
    }
    if (includePermissions) {
      // 权限是英文技术词（如 declarativeNetRequest），截断防爆token
      item.permissions = (ext.permissions ?? []).slice(0, 12)
      item.hosts = (ext.hostPermissions ?? []).slice(0, 6)
    }
    return item
  })

  let system
  if (presetMode) {
    // 预设模式：组名是唯一变量被锁死，模型只剩"分配"这一件事
    system = [
      "你是浏览器扩展管理助手。用户会给你一批浏览器扩展（编号、名称、描述）。",
      retry
        ? "以下是一批较难归类的扩展（上一轮未能分配）。请更仔细地逐个判断，名称和描述都要充分利用，知名扩展请用你的常识。"
        : "请把每个扩展分配到最合适的预设分组。",
      "规则：",
      "1. 只能使用输入中出现的扩展编号（no 字段），绝对不要发明编号",
      "2. 一个扩展最多出现在一个分组中（选择最合适的一个）",
      `3. 分组名必须严格使用以下预设分组，一个字都不能改、不能发明新分组：${presetGroups.join("、")}`,
      "4. 判断用途的依据按优先级：扩展名称（很多名称直接说明了作用）和描述 → 你已有的常识（知名扩展即使描述为空也要分类）",
      "5. 确实无法归入任何预设分组的扩展直接跳过，不要强行归类（用户会自己手动分组）",
      '6. 输出严格的 JSON：{"suggestions":[{"name":"预设分组名","nos":["1","3"]}]}，nos 里填扩展编号，不要输出 JSON 以外的任何文字'
    ].join("\n")
  } else {
    // 自由模式：分组总数上限——告诉模型"已有多少组、本次还能建几个"，
    // 它才会优先复用已有分组语义而不是滥建新组。下限 3 是防止已有分组很多时模型不敢建组
    const TOTAL_GROUP_LIMIT = 12
    const existingCount = (existingGroupNames ?? []).length
    const newGroupBudget = Math.max(3, TOTAL_GROUP_LIMIT - existingCount)

    const intro = retry
      ? "以下是一批较难识别的浏览器扩展（上一轮未能归类）。请更仔细地逐个判断，名称和描述都要充分利用，知名扩展请用你的常识。"
      : "请根据扩展的功能和用途，把它们分成若干个语义清晰的分组。"

    system = [
      "你是浏览器扩展管理助手。用户会给你一批浏览器扩展（编号、名称、描述）以及已存在的分组名列表。",
      intro,
      "规则：",
      "1. 只能使用输入中出现的扩展编号（no 字段），绝对不要发明编号",
      "2. 一个扩展最多出现在一个分组中（选择最合适的一个）",
      `3. 分组名要非常简短：2 到 5 个字（如「翻译」「广告拦截」「开发工具」「购物」）；desc 用一句话（不超过 ${DESC_MAX_LEN} 个字）说明该组的用途`,
      "4. 不要建议与已存在分组同名的组；已有分组不需要重新建议。语义相近也不行：如已有「AI助手」就不要再建「AI对话」「AI笔记」，把相关扩展并入已有组",
      `5. 用户目前已有 ${existingCount} 个分组，新建分组后总数尽量控制在 ${TOTAL_GROUP_LIMIT} 个以内，因此本次新建分组通常不超过 ${newGroupBudget} 个；优先把扩展归入语义最接近的类别，不要为了细分而多建组`,
      "6. 判断用途的依据按优先级：",
      "   - 扩展名称（很多名称直接说明了作用）和描述",
      "   - 你已有的常识：对知名的扩展，即使描述为空也要根据你了解的用途分类",
      "   - 确实无法判断用途的扩展直接跳过，不要强行归类（用户会自己手动分组）",
      `7. 每个分组至少要有 ${MIN_PER_GROUP} 个扩展才值得单独建组；凑不够时把这些扩展并入语义最接近的类别，或直接跳过`,
      '8. 输出严格的 JSON：{"suggestions":[{"name":"组名","desc":"用途","nos":["1","3"]}]}，nos 里填扩展编号，不要输出 JSON 以外的任何文字',
      `9. 使用 ${uiLanguage} 作为分组名和描述的语言`
    ].join("\n")
  }

  const user = JSON.stringify({
    existingGroups: presetMode ? presetGroups : (existingGroupNames ?? []),
    extensions: numbered
  })

  return {
    messages: [
      { role: "system", content: system },
      { role: "user", content: user }
    ],
    idByNo
  }
}

/**
 * 校验并清洗 LLM 返回的分组建议
 *
 * @param {unknown} parsed chatJson 的返回值
 * @param {{extensions: Array<{id: string, name?: string}>, existingGroupNames: string[], idByNo?: Map<string, string>, maxGroups?: number, maxPerGroup?: number, maxMerges?: number, minPerGroup?: number, allowedNames?: string[]}} ctx
 *   allowedNames: 组名白名单（预设模式传入预设分组），不在名单内的建议一律丢弃
 * @returns {{suggestions: Array<{name: string, desc: string, extensionIds: string[]}>, merges: Array<{name: string, extensionIds: string[]}>, rawCount: number}}
 * suggestions 是要新建的分组；merges 是与现有分组同名的建议（把这些扩展并入现有组，
 * 而不是丢弃——模型的分类难免和用户已有分组撞名，丢弃会让这批扩展凭空消失）。
 * 成员数不足 minPerGroup 的新建建议会被过滤（避免"碎组"），merges 不受此限制。
 * rawCount 是模型原始给出的建议条数，与 suggestions.length + merges.length 的差值
 * 即被过滤的数量，便于上层区分「模型没给建议」和「建议全被校验过滤」。
 */
export function validateGroupSuggestions(parsed, ctx) {
  const {
    extensions,
    existingGroupNames = [],
    idByNo = new Map(),
    maxGroups = 12,
    // 编号方案后输出已经很紧凑，上限放宽到 100：
    // 大量同类扩展（如几十个翻译类）挤进同一组时不至于被静默截断
    maxPerGroup = 100,
    maxMerges = 4,
    minPerGroup = MIN_PER_GROUP,
    allowedNames
  } = ctx ?? {}

  // 预设模式的组名白名单（小写 key），模型输出名单外的组名视为不合规
  const allowedNameKeys = Array.isArray(allowedNames)
    ? new Set(allowedNames.map((name) => String(name).trim().toLowerCase()))
    : null

  const realIds = new Set((extensions ?? []).map((ext) => ext.id))
  // 模型有时会把扩展名称写进 extensionIds，按名称（忽略大小写）回查真实 id
  const idByName = new Map()
  for (const ext of extensions ?? []) {
    const name = String(ext.name ?? "")
      .trim()
      .toLowerCase()
    if (name) {
      idByName.set(name, ext.id)
    }
  }

  // 现有分组名（key 小写）；名字 → 原名，供 merges 展示
  const existingNames = new Map(
    (existingGroupNames ?? []).map((name) => [
      String(name).trim().toLowerCase(),
      String(name).trim()
    ])
  )

  // 兼容常见输出形状：{"suggestions": [...]}、{"groups": [...]}、顶层数组
  let raw
  if (Array.isArray(parsed)) {
    raw = parsed
  } else if (Array.isArray(parsed?.suggestions)) {
    raw = parsed.suggestions
  } else if (Array.isArray(parsed?.groups)) {
    raw = parsed.groups
  } else {
    raw = []
  }

  const suggestions = []
  const merges = []
  const seenNames = new Map()

  for (const item of raw) {
    if (!item || typeof item !== "object") {
      continue
    }

    // 过滤幻觉 id 并去重（保持模型给出的顺序）；编号或名称形式的引用先回查成真实 id。
    // 模型输出的编号可能是字符串 "1" 也可能是数字 1，统一转字符串再查
    const refs = [
      ...new Set(
        Array.isArray(item.nos)
          ? item.nos
          : Array.isArray(item.extensionIds)
            ? item.extensionIds
            : []
      )
    ]
      .map((ref) => resolveExtensionRef(ref, realIds, idByName, idByNo))
      .filter((id) => id !== null)
      .slice(0, maxPerGroup)

    const name = String(item.name ?? "")
      .trim()
      .slice(0, NAME_MAX_LEN)
    if (name.length === 0 || refs.length === 0) {
      continue
    }

    const nameKey = name.toLowerCase()

    // 预设模式白名单：名单外的组名（如模型自作主张的「其他」）直接丢弃
    if (allowedNameKeys && !allowedNameKeys.has(nameKey)) {
      continue
    }

    // 与现有分组同名 → 作为「并入现有组」的建议返回，由用户勾选后合并
    if (existingNames.has(nameKey)) {
      if (merges.length < maxMerges) {
        merges.push({ name: existingNames.get(nameKey), extensionIds: refs })
      }
      continue
    }

    // 与本批新建议同名 → 直接并入先前的建议，不重复建组
    if (seenNames.has(nameKey)) {
      const exist = seenNames.get(nameKey)
      exist.extensionIds = [...new Set([...exist.extensionIds, ...refs])].slice(0, maxPerGroup)
      continue
    }
    seenNames.set(nameKey, {
      name,
      desc: String(item.desc ?? "")
        .trim()
        .slice(0, DESC_MAX_LEN),
      extensionIds: refs
    })
    suggestions.push(seenNames.get(nameKey))

    if (suggestions.length >= maxGroups) {
      break
    }
  }

  // 碎组过滤放在累积之后：本批同名建议合并后凑够 minPerGroup 的组仍然有效
  const keptSuggestions = suggestions.filter((item) => item.extensionIds.length >= minPerGroup)

  return { suggestions: keptSuggestions, merges, rawCount: raw.length }
}

/**
 * 构建「分组冗余检查」的提示词：把用户的现有分组名交给模型，
 * 找出语义重复或高度相近的组合并方案（如「AI对话」并入「AI助手」）。
 * 用于清理分批分析产生的同义组，以及用户历史上累积的冗余分组。
 *
 * @param {string[]} groupNames 不含固定/隐藏分组的普通分组名
 * @param {string} uiLanguage
 * @returns {Array<{role: string, content: string}>}
 */
export function buildMergeCheckMessages(groupNames, uiLanguage) {
  const system = [
    "你是浏览器扩展管理助手。下面是一个用户浏览器扩展的分组名列表。",
    "请找出其中语义重复或高度相近的分组（例如「AI助手」和「AI对话」、「购物助手」和「购物比价」、「数据采集」和「网页采集」）。",
    "每组冗余给出一个合并建议：from 是被合并消失的组，to 是保留的组（保留名字更短、更通用的那个）。",
    "同一个组只能作为 from 出现一次。没有冗余就返回空数组。",
    '输出严格的 JSON：{"merges":[{"from":"AI对话","to":"AI助手"}]}，不要输出 JSON 以外的任何文字。',
    `只能使用列表中出现的组名。使用 ${uiLanguage} 回复`
  ].join("\n")

  return [
    { role: "system", content: system },
    { role: "user", content: JSON.stringify({ groupNames: groupNames ?? [] }) }
  ]
}

/**
 * 校验冗余合并建议：from/to 必须都真实存在、不能是自己、同一 from 只出现一次
 *
 * @param {unknown} parsed
 * @param {string[]} groupNames
 * @returns {Array<{from: string, to: string}>}
 */
export function validateMergeSuggestions(parsed, groupNames) {
  const nameSet = new Set((groupNames ?? []).map((name) => String(name).trim()))
  const raw = Array.isArray(parsed?.merges) ? parsed.merges : []

  const result = []
  const seenFrom = new Set()
  for (const item of raw) {
    if (!item || typeof item !== "object") {
      continue
    }
    const from = String(item.from ?? "").trim()
    const to = String(item.to ?? "").trim()
    if (!nameSet.has(from) || !nameSet.has(to) || from === to) {
      continue
    }
    if (seenFrom.has(from)) {
      continue
    }
    seenFrom.add(from)
    result.push({ from, to })
  }
  return result
}

/**
 * 把模型给出的单个引用解析成真实扩展 id，按优先级：
 * 1. 短编号（如 "1"，可能是数字 1）→ 查 idByNo 映射回真实 id
 * 2. 本来就是真实 id 的原样返回（兼容模型不守规矩直接抄 id）
 * 3. 写成了扩展名称的按名称回查
 * 都对不上视为幻觉返回 null。
 */
function resolveExtensionRef(ref, realIds, idByName, idByNo) {
  const key = String(ref ?? "").trim()
  if (key.length === 0) {
    return null
  }
  const byNo = idByNo.get(key)
  if (byNo) {
    return byNo
  }
  if (realIds.has(key)) {
    return key
  }
  return idByName.get(key.toLowerCase()) ?? null
}
