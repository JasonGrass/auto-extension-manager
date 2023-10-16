import { useEffect } from "react"

import storage from ".../storage/sync"

/**
 * 监听扩展的安装，如果扩展安装成功，则根据配置写入别名和备注
 */
export function useExtensionInstallListener(inputItems, isImportAlias, isImportRemark) {
  useEffect(() => {
    const handler = async (info) => {
      const one = inputItems.find((i) => i.id === info.id)

      if (!one) {
        return
      }

      if (isImportAlias && one.alias) {
        await storage.management.updateExtension(one.id, { alias: one.alias })
      }
      if (isImportRemark && one.remark) {
        await storage.management.updateExtension(one.id, { remark: one.remark })
      }
    }

    chrome.management.onInstalled.addListener(handler)

    return () => {
      chrome.management.onInstalled.removeListener(handler)
    }
  }, [inputItems, isImportAlias, isImportRemark])
}
