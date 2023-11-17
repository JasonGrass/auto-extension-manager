import { useEffect, useMemo, useState } from "react"

import chromeP from "webext-polyfill-kinda"

import { ExtensionRepo } from ".../pages/Background/extension/ExtensionRepo"
import { isMatchByCurrent } from ".../pages/Background/rule/handlers/matchHandler"
import { LocalOptions } from ".../storage/local"
import { ManualEnableCounter } from ".../storage/local/ManualEnableCounter"
import { appendAdditionInfo, sortExtension } from ".../utils/extensionHelper"

const manualEnableCounter = new ManualEnableCounter()
const localOptions = new LocalOptions()

const EMPTY_ITEMS = { top: [], enabled: [], disabled: [] }

const extensionRecordRepo = new ExtensionRepo()

/**
 * 根据浏览器 extension 和配置信息，对 popup 显示的扩展列表进行预处理
 * 1 附加别名等额外的信息
 * 2 根据配置进行排序
 * 返回启用的扩展列表和禁用的扩展列表
 */
export const usePopupExtensions = (extensions, options, moved) => {
  // 置顶的扩展 开启状态的扩展 禁用状态的扩展

  const [items, setItems] = useState(EMPTY_ITEMS)

  const build = async (extensions, options) => {
    if (!extensions || extensions.length === 0) {
      setItems(EMPTY_ITEMS)
      return
    }

    const [list0, list1, list2] = await buildShowItems(extensions, options)
    if (list0.length === 0 && list1.length === 0 && list2.length === 0) {
      return
    }

    const [enableExtensions, disableExtensions] = await sortShowItems(options, list1, list2)

    setItems({ top: list0, enabled: enableExtensions, disabled: disableExtensions })
  }

  useEffect(() => {
    build(extensions, options)
  }, [extensions, options, moved])

  return [items]
}

async function sortShowItems(options, list1, list2) {
  // 先按照名称排序执行一次
  const list1_pre = sortExtension(list1)
  const list2_pre = sortExtension(list2)

  if (!options.setting.isSortByFrequency) {
    return [list1_pre, list2_pre]
  }

  // 如果有需要，再按照频率排序
  const refList = await manualEnableCounter.getOrder()
  return [sortByReferenceList(refList, list1_pre), sortByReferenceList(refList, list2_pre)]
}

async function buildShowItems(extensions, options) {
  const list = appendAdditionInfo(extensions, options)
  let list1 = list.filter((i) => i.enabled)
  let list2 = list.filter((i) => !i.enabled)

  // 筛选置顶的扩展, 返回的是已经排序的扩展 id 列表
  const topExtensionsIds = await findTopExtensions(extensions, options)

  let list0 = list.filter((i) => topExtensionsIds.includes(i.id))
  list1 = list1.filter((i) => !topExtensionsIds.includes(i.id))
  list2 = list2.filter((i) => !topExtensionsIds.includes(i.id))

  // 不显示那些在隐藏分组中的扩展
  const hiddenExtensions = options.groups?.find((g) => g.id === "hidden")?.extensions
  if (hiddenExtensions) {
    list1 = list1.filter((i) => !hiddenExtensions.includes(i.id))
    list2 = list2.filter((i) => !hiddenExtensions.includes(i.id))
  }

  return [sortByReferenceList(topExtensionsIds, list0), list1, list2]
}

/**
 * 找出那些应该置顶显示的扩展；返回结果已经进行了排序，返回结果是 ID 列表;
 * 排序规则：
 * 1 规则设置的在前，最近更新的在后
 * 2 规则设置置顶的，按是否启用+名称排序
 * 3 最近更新的，按更新时间倒序
 */
export async function findTopExtensions(extensions, options) {
  const byRuleIds = await findTopExtensionsByRule(options)

  const byRecentlyIds = await findTopExtensionsByRecentlyUpdate(options)

  if (byRuleIds.length === 0) {
    return byRecentlyIds
  }

  // 先按名称排序
  let byRuleOrderedExts = sortExtension(
    extensions.filter((ext) => byRuleIds.includes(ext.id)),
    { ignoreEnable: false }
  )
  let byRuleOrderedId = byRuleOrderedExts.map((ext) => ext.id)

  // 再按照频率排序
  if (options.setting.isSortByFrequency) {
    const refList = await manualEnableCounter.getOrder()
    byRuleOrderedId = sortByReferenceList(refList, byRuleOrderedId)
  }

  return Array.from(new Set([...byRuleOrderedId, ...byRecentlyIds]))
}

/**
 * 最近更新的扩展，返回的是 ID 列表
 */
async function findTopExtensionsByRecentlyUpdate(options) {
  if (!options.setting.isTopRecentlyUpdate) {
    return []
  }

  const mode = options.setting.topRecentlyMode ?? "install"
  const days = options.setting.topRecentlyDays ?? 7

  const ids = await extensionRecordRepo.getKeys()
  const records = []
  for (const id of ids) {
    const record = await extensionRecordRepo.get(id)
    if (record) {
      records.push(record)
    }
  }

  const normalizeTime = (t) => {
    if (!t) {
      return 0
    }
    return t
  }

  const now = new Date().getTime()
  const expired = now - days * 24 * 60 * 60 * 1000
  const items = records.filter((r) => {
    const installDate = normalizeTime(r.installDate)
    const updateDate = normalizeTime(r.updateDate)

    if (installDate > expired) {
      return true
    }
    if (mode === "update" && updateDate > expired) {
      return true
    }
    return false
  })

  const sortedItems = items.sort((a, b) => {
    const ta = Math.max(normalizeTime(a.installDate), normalizeTime(a.updateDate))
    const tb = Math.max(normalizeTime(b.installDate), normalizeTime(b.updateDate))
    return tb - ta
  })

  return sortedItems.map((i) => i.id)
}

/**
 * 由规则配置的，置顶的扩展（返回的是 ID 列表）
 */
async function findTopExtensionsByRule(options) {
  const tabs = await chromeP.tabs.query({
    active: true,
    lastFocusedWindow: true
  })
  const currentTab = tabs ? tabs[0] : undefined

  if (!options.ruleConfig) {
    return []
  }

  // 挑选所有配置了 showOnTheTop 的规则
  const rules = options.ruleConfig
    .filter((rule) => {
      return rule.action.showOnTheTop
    })
    .filter((rule) => rule.enable)

  if (rules.length < 1) {
    return []
  }

  const sceneId = await localOptions.getActiveSceneId()

  // 找到所有匹配当前标签页的规则
  const matchRules = []
  for (const rule of rules) {
    const isMatch = await isMatchByCurrent({ id: sceneId }, rule, currentTab)
    if (isMatch) {
      matchRules.push(rule)
    }
  }

  // 从规则数据中，把目标扩展扒出来
  const ids = matchRules
    .map((rule) => {
      if (!rule.target) {
        return null
      }

      const extensionIds = rule.target.extensions ?? []
      const groupIds = rule.target.groups ?? []

      groupIds.forEach((groupId) => {
        const one = options.groups.find((g) => g.id === groupId)
        if (one && one.extensions) {
          extensionIds.push(...one.extensions)
        }
      })

      return extensionIds
    })
    .filter(Boolean)
    .flat()

  // 去重
  return Array.from(new Set(ids))
}

/**
 * 根据指定的列表进行排序
 */
export function sortByReferenceList(orderExtIdList, list) {
  if (orderExtIdList.length === 0) return list

  const result = []
  const orderedIdList = []

  for (const refer of orderExtIdList) {
    const item = list.find((i) => i.id === refer)
    if (item) {
      orderedIdList.push(item.id)
      result.push(item)
    }
  }

  const left = list.filter((ext) => !orderedIdList.includes(ext.id))
  return [...result, ...left]
}
