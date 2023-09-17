import { useEffect, useState } from "react"

import storage from ".../storage/sync"

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
      let fixedGroup = groups.find((g) => g.id === "fixed")

      const set = new Set(fixedGroup.extensions)

      if (pined) {
        set.add(item.id)
        const ids = Array.from(set)
        fixedGroup.extensions = ids
        storage.group.update(fixedGroup)
      } else {
        set.delete(item.id)
        const ids = Array.from(set)
        fixedGroup.extensions = ids
        storage.group.update(fixedGroup)
      }
    })
  }

  return [itemPined, updatePined]
}
