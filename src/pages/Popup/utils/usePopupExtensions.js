import { useEffect, useMemo, useState } from "react"

import chromeP from "webext-polyfill-kinda"

import { isMatchByCurrent } from ".../pages/Background/rule/handlers/matchHandler"
import { LocalOptions } from ".../storage/local"
import { ManualEnableCounter } from ".../storage/local/ManualEnableCounter"
import { appendAdditionInfo, sortExtension } from ".../utils/extensionHelper"

const manualEnableCounter = new ManualEnableCounter()
const localOptions = new LocalOptions()

const EMPTY_ITEMS = { top: [], enabled: [], disabled: [] }

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
    const [topExtensions, enableExtensions, disableExtensions] = await sortShowItems(
      options,
      list0,
      list1,
      list2
    )

    setItems({ top: topExtensions, enabled: enableExtensions, disabled: disableExtensions })
  }

  useEffect(() => {
    build(extensions, options)
  }, [extensions, options, moved])

  return [items]
}

async function sortShowItems(options, list0, list1, list2) {
  // 先按照名称排序执行一次
  const list0_pre = sortExtension(list0, { ignoreEnable: true })
  const list1_pre = sortExtension(list1)
  const list2_pre = sortExtension(list2)

  if (!options.setting.isSortByFrequency) {
    return [list0_pre, list1_pre, list2_pre]
  }

  // 如果有需要，再按照频率排序
  const refList = await manualEnableCounter.getOrder()
  return [order(refList, list0_pre), order(refList, list1_pre), order(refList, list2_pre)]
}

async function buildShowItems(extensions, options) {
  const list = appendAdditionInfo(extensions, options)
  let list1 = list.filter((i) => i.enabled)
  let list2 = list.filter((i) => !i.enabled)

  // 筛选置顶的扩展
  const topExtensions = await findTopExtensions(options)
  let list0 = list.filter((i) => topExtensions.includes(i.id))
  list1 = list1.filter((i) => !topExtensions.includes(i.id))
  list2 = list2.filter((i) => !topExtensions.includes(i.id))

  // 不显示那些在隐藏分组中的扩展
  const hiddenExtensions = options.groups?.find((g) => g.id === "hidden")?.extensions
  if (hiddenExtensions) {
    list0 = list0.filter((i) => !hiddenExtensions.includes(i.id))
    list1 = list1.filter((i) => !hiddenExtensions.includes(i.id))
    list2 = list2.filter((i) => !hiddenExtensions.includes(i.id))
  }

  return [list0, list1, list2]
}

// 找出那些应该置顶显示的扩展
export async function findTopExtensions(options) {
  const tabs = await chromeP.tabs.query({
    active: true,
    lastFocusedWindow: true
  })
  const currentTab = tabs ? tabs[0] : undefined

  if (!options.ruleConfig) {
    return []
  }

  // 挑选所有配置了 showOnTheTop 的规则
  const rules = options.ruleConfig.filter((rule) => {
    return rule.action.showOnTheTop
  })

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

export function order(orderExtIdList, list) {
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
