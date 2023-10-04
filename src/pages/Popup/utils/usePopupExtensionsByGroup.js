import { useEffect, useMemo, useState } from "react"

import { ManualEnableCounter } from ".../storage/local/ManualEnableCounter"
import { appendAdditionInfo, sortExtension } from ".../utils/extensionHelper"
import { getLang } from ".../utils/utils"
import { findTopExtensions, order } from "./usePopupExtensions"

const manualEnableCounter = new ManualEnableCounter()

/**
 * 根据浏览器 extension 和配置信息，对 popup 显示的扩展列表进行预处理
 * 1 附加别名等额外的信息
 * 2 根据配置进行排序
 * 返回按分组归类的扩展组
 */
export const usePopupExtensionsByGroup = (extensions, options, moved) => {
  // 置顶的扩展 开启状态的扩展 禁用状态的扩展

  const [items, setItems] = useState([])

  const build = async (extensions, options) => {
    if (!extensions || extensions.length === 0) {
      setItems([])
      return
    }

    const groups = await buildShowItems(extensions, options)
    if (groups.length === 0) {
      return
    }

    setItems(groups)
  }

  useEffect(() => {
    build(extensions, options)
  }, [extensions, options, moved])

  return [items]
}

async function buildShowItems(extensions, options) {
  const list = appendAdditionInfo(extensions, options)

  // 筛选置顶的扩展
  const topExtensions = await findTopExtensions(options)
  let list0 = list.filter((i) => topExtensions.includes(i.id))

  // 不显示那些在隐藏分组中的扩展
  const hiddenExtensions = options.groups?.find((g) => g.id === "hidden")?.extensions || []
  list0 = list0.filter((i) => !hiddenExtensions.includes(i.id))

  const shownGroups = []
  if (list0.length > 0) {
    shownGroups.push({
      id: "__v_top__",
      name: "",
      extensions: await sortShowItems(options, list0)
    })
  }

  const groupArray = options.groups ?? []
  const asyncGroups = groupArray.map(async (g) => {
    // 不显示 hidden 分组
    if (g.id === "hidden") {
      return null
    }
    // 不显示 fixed 分组
    if (g.id === "fixed" && !options.setting.isShowFixedExtension) {
      return null
    }
    // 不显示空分组
    if (!g.extensions || g.extensions.length === 0) {
      return null
    }
    // 不显示被隐藏的扩展
    const extArray = list
      .filter((i) => g.extensions.includes(i.id))
      .filter((i) => !hiddenExtensions.includes(i.id))

    if (extArray.length === 0) {
      return null
    }

    let groupName = g.name
    if (g.id === "fixed") {
      groupName = getLang("group_fixed_name")
    }

    return {
      id: g.id,
      name: groupName,
      extensions: await sortShowItems(options, extArray)
    }
  })

  let groups = await Promise.all(asyncGroups)
  groups = groups.filter(Boolean)

  return [...shownGroups, ...groups]
}

async function sortShowItems(options, list) {
  // 先按照名称排序执行一次
  const list_pre = sortExtension(list, { ignoreEnable: true })

  if (!options.setting.isSortByFrequency) {
    return list_pre
  }

  // 如果有需要，再按照频率排序
  const refList = await manualEnableCounter.getOrder()
  return order(refList, list_pre)
}
