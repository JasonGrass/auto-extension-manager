import { useEffect, useState } from "react"

import storage from ".../storage/sync"
import { filterExtensions, isExtExtension } from ".../utils/extensionHelper.js"
import { ExtensionChannelWorker } from "../worker/ExtensionChannelWorker"

const ChannelWorker = new ExtensionChannelWorker()

export const useInit = (callback) => {
  const [extensions, setExtensions] = useState([])
  const [options, setOptions] = useState()

  useEffect(() => {
    const ready = async () => {
      const exts = await chrome.management.getAll()
      const list = filterExtensions(exts, isExtExtension)

      for (const ext of list) {
        const channel = await ChannelWorker.getExtensionChannel(ext.id)
        ext.channel = channel
      }

      const allOptions = await storage.options.getAll()

      setOptions(allOptions)
      setExtensions(list)

      callback?.()
    }

    ready()
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  return [extensions, options]
}
