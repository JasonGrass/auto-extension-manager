import React, { useCallback, useEffect, useState } from "react"

import { storage } from ".../storage/sync"
import { getLang } from ".../utils/utils"
import { ExtensionIconBuilder } from "../../Background/extension/ExtensionIconBuilder"
import { ExtensionRepo } from "../../Background/extension/ExtensionRepo"
import { HistoryRepo } from "../../Background/history/HistoryRepo"
import { HistoryService } from "../../Background/history/HistoryService"
import Title from "../Title.jsx"
import ExtensionHistory from "./ExtensionHistory.jsx"
import { getHiddenExtIds } from "./hiddenRecordHelper"

const ExtensionManageIndex = () => {
  // 历史记录
  const [historyRecords, setHistoryRecords] = useState([])
  // 隐藏的数据
  const [hiddenExtensionIds, setHiddenExtensionIds] = useState([])

  // 表格的 loading 显示
  const [loading, setLoading] = useState(true)

  const init = async () => {
    // 读取历史记录
    const repo = new HistoryRepo()
    const service = new HistoryService(repo)
    const records = await service.queryAll()
    // 最新的在最前
    records.reverse()
    // 附加序号
    records.forEach((item, index) => {
      item.index = index
    })
    // 填充 ICON 数据
    await ExtensionIconBuilder.fill(records)
    // 填充附加数据(别名与备注)
    const attach = await storage.management.get()
    const attachExtensionInfo = attach.extensions ?? []
    for (const attachItem of attachExtensionInfo) {
      records
        .filter((item) => item.extensionId === attachItem.extId)
        .forEach((item) => {
          item.__attach__ = attachItem
        })
    }

    // 附加扩展数据本身
    const extRepo = new ExtensionRepo()
    for (const record of records) {
      const cache = await extRepo.get(record.extensionId)
      record.__extension__ = cache
    }

    const hiddenExtIds = await getHiddenExtIds()

    setHiddenExtensionIds(hiddenExtIds)
    setHistoryRecords(records)

    // ExtensionHistory 内部使用 useBatchEffect 延迟了 100ms
    setTimeout(() => {
      setLoading(false)
    }, 100)
  }

  useEffect(() => {
    init()
  }, [])

  return (
    <div>
      <Title title={getLang("history_title")}></Title>
      <ExtensionHistory
        records={historyRecords}
        hiddenExtensionIds={hiddenExtensionIds}
        loading={loading}></ExtensionHistory>
    </div>
  )
}

export default ExtensionManageIndex
