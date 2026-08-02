import { useEffect, useState } from "react"

import storage from ".../storage/sync"

/**
 * 判断单个扩展是否在固定分组中
 * @param {*} item
 * @param {*} options
 * @returns
 */
export function useExtensionItemPin(item, options) {
  // 扩展是否在固定分组中
  const [itemPined, setItemPined] = useState(false)

  // 初始化
  useEffect(() => {
    const fixExts = options.groups.find((g) => g.id === "fixed")?.extensions
    if (!fixExts) {
      return
    }

    setItemPined(fixExts.includes(item.id))
  }, [item, options])

  // 更新 pin 状态，并保存到配置中
  const updatePined = (pined) => {
    setItemPined(pined)

    storage.group.getGroups().then((groups) => {
      const fixedGroup = groups.find((g) => g.id === "fixed")

      const set = new Set(fixedGroup.extensions)

      if (pined) {
        set.add(item.id)
        const ids = Array.from(set)
        fixedGroup.extensions = ids
        updateFixedGroup(fixedGroup, ids)
      } else {
        set.delete(item.id)
        const ids = Array.from(set)
        fixedGroup.extensions = ids
        updateFixedGroup(fixedGroup, ids)
      }
    })
  }

  const updateFixedGroup = async (fixedGroup, ids) => {
    await storage.group.update(fixedGroup)

    // 同步 Popup 初始化时读取的 options，让分组开关立即使用最新固定成员集合。
    const optionFixedGroup = options.groups.find((group) => group.id === "fixed")
    if (optionFixedGroup) {
      optionFixedGroup.extensions ??= []
      optionFixedGroup.extensions.splice(0, optionFixedGroup.extensions.length, ...ids)
    }
    window.dispatchEvent(new Event("popup-fixed-group-changed"))
  }

  return [itemPined, updatePined]
}
