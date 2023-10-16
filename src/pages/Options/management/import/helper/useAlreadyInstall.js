import { useEffect, useState } from "react"

import { getIcon } from ".../utils/extensionHelper"

/**
 * 根据依赖条件，生成已经安装的扩展列表
 */
export function useAlreadyInstall(extensions, inputs, isImportAlias, isImportRemark) {
  const [installItems, setInstallItems] = useState([])
  const [newInstallItems, setNewInstallItems] = useState([])

  useEffect(() => {
    const inputIds = inputs.map((e) => e.id)

    const existItems = extensions.filter((ext) => inputIds.includes(ext.id))

    const newInstallIds = newInstallItems.map((i) => i.id)

    setInstallItems([
      ...existItems.filter((ext) => !newInstallIds.includes(ext.id)),
      ...newInstallItems
    ])
  }, [extensions, inputs, newInstallItems])

  useEffect(() => {
    const handler = async (info) => {
      const one = inputs.find((i) => i.id === info.id)
      if (!one) {
        return
      }

      info.icon = getIcon(info, 48)
      if (isImportAlias) {
        info.alias = one.alias
      }
      if (isImportRemark) {
        info.remark = one.remark
      }
      info.channel = one.channel

      setNewInstallItems((prev) => {
        return [...prev, info]
      })
    }

    chrome.management.onInstalled.addListener(handler)
    return () => {
      chrome.management.onInstalled.removeListener(handler)
    }
  }, [inputs, isImportAlias, isImportRemark])

  return [installItems]
}
