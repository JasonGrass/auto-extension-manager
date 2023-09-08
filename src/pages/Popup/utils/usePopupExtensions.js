import { useEffect, useState } from "react"

import { ManualEnableCounter } from ".../storage/local/ManualEnableCounter"
import { appendAdditionInfo, sortExtension } from ".../utils/extensionHelper"

const manualEnableCounter = new ManualEnableCounter()

/**
 * 根据浏览器 extension 和配置信息，对 popup 显示的扩展列表进行预处理
 * 1 附加别名等额外的信息
 * 2 根据配置进行排序
 * 返回启用的扩展列表和禁用的扩展列表
 */
export const usePopupExtensions = (extensions, options) => {
  const [items1, setItems1] = useState([])
  const [items2, setItems2] = useState([])

  useEffect(() => {
    const list = appendAdditionInfo(extensions, options)
    const list1 = list.filter((i) => i.enabled)
    const list2 = list.filter((i) => !i.enabled)

    if (options.setting.isSortByFrequency) {
      manualEnableCounter.getOrder().then((orderExtIdList) => {
        setItems1(order(orderExtIdList, list1))
        setItems2(order(orderExtIdList, list2))
      })
    } else {
      setItems1(sortExtension(list1))
      setItems2(sortExtension(list2))
    }
  }, [extensions, options])

  return [items1, items2]
}

function order(orderExtIdList, list) {
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
