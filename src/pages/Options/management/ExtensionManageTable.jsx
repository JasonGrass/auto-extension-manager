import React, { useEffect, useState } from "react"

import chromeP from "webext-polyfill-kinda"

import storage from ".../storage/sync"
import { filterExtensions, isExtExtension } from ".../utils/extensionHelper.js"
import analytics from ".../utils/googleAnalyze.js"
import ExtensionManage from "./ExtensionManage.jsx"
import { ExtensionChannelWorker } from "./worker/ExtensionChannelWorker"

const ChannelWorker = new ExtensionChannelWorker()

const ExtensionManageTable = () => {
  const [extensions, setExtensions] = useState([])
  const [options, setOptions] = useState()

  useEffect(() => {
    const ready = async () => {
      const exts = await chromeP.management.getAll()
      const list = filterExtensions(exts, isExtExtension)

      for (const ext of list) {
        const channel = await ChannelWorker.getExtensionChannel(ext.id)
        ext.channel = channel
      }

      const allOptions = await storage.options.getAll()

      setOptions(allOptions)
      setExtensions(list)

      analytics.fireEvent("alias_setting_open", {
        totalCount: allOptions.management.extensions.length
      })
    }

    ready()
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

  if (!options) {
    return null
  }

  return <ExtensionManage extensions={extensions} options={options}></ExtensionManage>
}

export default ExtensionManageTable
