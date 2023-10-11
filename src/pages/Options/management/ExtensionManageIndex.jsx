import React, { useEffect, useState } from "react"

import chromeP from "webext-polyfill-kinda"

import storage from ".../storage/sync"
import { filterExtensions, isExtExtension } from ".../utils/extensionHelper.js"
import analytics from ".../utils/googleAnalyze.js"
import { getLang } from "../../../utils/utils.js"
import Title from "../Title.jsx"
import ExtensionManage from "./ExtensionManage.jsx"
import { ExtensionChannelWorker } from "./worker/ExtensionChannelWorker"

const ChannelWorker = new ExtensionChannelWorker()

const ExtensionManageIndex = () => {
  const [extensions, setExtensions] = useState([])
  const [managementConfig, setManagementConfig] = useState({})

  useEffect(() => {
    const ready = async () => {
      const exts = await chromeP.management.getAll()
      const list = filterExtensions(exts, isExtExtension)

      for (const ext of list) {
        const channel = await ChannelWorker.getExtensionChannel(ext.id)
        ext.channel = channel
      }

      setExtensions(list)
    }

    ready()
    storage.management.get().then((res) => {
      setManagementConfig(res)

      analytics.fireEvent("alias_setting_open", {
        totalCount: res.extensions.length
      })
    })
  }, [])

  useEffect(() => {
    const handler = (id) => {
      setExtensions((prev) => prev.filter((ext) => ext.id !== id))
    }
    chrome.management.onUninstalled.addListener(handler)
    return () => {
      chrome.management.onUninstalled.removeListener(handler)
    }
  }, [])

  return (
    <div>
      <Title title={getLang("alias_title")}></Title>
      <ExtensionManage extensions={extensions} config={managementConfig}></ExtensionManage>
    </div>
  )
}

export default ExtensionManageIndex
