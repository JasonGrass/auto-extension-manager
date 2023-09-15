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
    let list1 = list.filter((i) => i.enabled)
    let list2 = list.filter((i) => !i.enabled)

    // 不显示那些在隐藏分组中的扩展
    const hiddenExtensions = options.groups?.find((g) => g.id === "hidden")?.extensions
    if (hiddenExtensions) {
      list1 = list1.filter((i) => !hiddenExtensions.includes(i.id))
      list2 = list2.filter((i) => !hiddenExtensions.includes(i.id))
    }

    if (options.setting.isSortByFrequency) {
      manualEnableCounter.getOrder().then((orderExtIdList) => {
        if (list1.length === 0 && list2.length === 0) {
          // 初始化组件时，list 是空的。但奇怪的是，预期首先执行的 setItem1/2（设置空数组），实际执行在 setItem1/2(有数据) 之后。
          // 这里对 Promise 微任务的执行是乱序的？
          return
        }

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
