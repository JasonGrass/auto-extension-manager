import React, { useEffect, useState } from "react"

import chromeP from "webext-polyfill-kinda"

import { ManageOptions } from ".../storage"
import { filterExtensions, isExtExtension } from ".../utils/extensionHelper.js"
import { ExtensionIconBuilder } from "../../Background/extension/ExtensionIconBuilder"
import { ExtensionRepo } from "../../Background/extension/ExtensionRepo"
import { HistoryRepo } from "../../Background/history/HistoryRepo"
import { HistoryService } from "../../Background/history/HistoryService"
import Title from "../Title.jsx"
import ExtensionHistory from "./ExtensionHistory.jsx"

const ExtensionManageIndex = () => {
  // 历史记录
  const [historyRecords, setHistoryRecords] = useState([])

  const init = async () => {
    // 读取历史记录
    const repo = new HistoryRepo()
    const service = new HistoryService(repo)
    const records = await service.queryAll()
    // 最新的在最前
    records.reverse()
    // 填充 ICON 数据
    await ExtensionIconBuilder.fill(records)
    // 填充附加数据(别名与备注)
    const attach = await ManageOptions.get()
    const attachExtensionInfo = attach.extensions ?? []
    for (const attachItem of attachExtensionInfo) {
      const record = records.find((item) => item.extensionId === attachItem.extId)
      if (record) {
        record.__attach__ = attachItem
      }
    }
    // 附加扩展数据本身
    const extRepo = new ExtensionRepo()
    for (const record of records) {
      const cache = await extRepo.get(record.extensionId)
      record.__extension__ = cache
    }

    setHistoryRecords(records)
  }

  useEffect(() => {
    init()
  }, [])

  return (
    <div>
      <Title title="历史记录"></Title>
      <ExtensionHistory records={historyRecords}></ExtensionHistory>
    </div>
  )
}

export default ExtensionManageIndex
