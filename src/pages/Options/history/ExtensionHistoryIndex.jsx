import React, { useEffect, useState } from "react"

import chromeP from "webext-polyfill-kinda"

import { ManageOptions } from ".../storage"
import { filterExtensions, isExtExtension } from ".../utils/extensionHelper.js"
import { ExtensionIconBuilder } from "../../Background/extension/ExtensionIconBuilder"
import { HistoryRepo } from "../../Background/history/HistoryRepo"
import { HistoryService } from "../../Background/history/HistoryService"
import Title from "../Title.jsx"
import ExtensionHistory from "./ExtensionHistory.jsx"

const ExtensionManageIndex = () => {
  const [extensions, setExtensions] = useState([])
  const [managementConfig, setManagementConfig] = useState({})

  const [historyRecords, setHistoryRecords] = useState([])

  useEffect(() => {
    chromeP.management.getAll().then((res) => {
      const list = filterExtensions(res, isExtExtension)
      setExtensions(list)
    })

    ManageOptions.get().then((res) => {
      setManagementConfig(res)
    })

    const repo = new HistoryRepo()
    const service = new HistoryService(repo)
    service.queryAll().then((records) => {
      records.reverse()
      ExtensionIconBuilder.fill(records).then((r) => {
        setHistoryRecords(records)
      })
    })
  }, [])

  return (
    <div>
      <Title title="历史记录"></Title>
      <ExtensionHistory
        extensions={extensions}
        config={managementConfig}
        records={historyRecords}></ExtensionHistory>
    </div>
  )
}

export default ExtensionManageIndex
