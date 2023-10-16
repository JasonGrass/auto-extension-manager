import { useEffect, useState } from "react"

/**
 * 根据输入依赖，计算准备安装的扩展列表
 */
export function useReadyInstall(extensions, inputs) {
  const [inputItems, setInputItems] = useState([])
  const [newInstallItems, setNewInstallItems] = useState([])

  useEffect(() => {
    const existIds = extensions.map((e) => e.id)

    const items = buildInputs(inputs)

    const newInstallIds = newInstallItems.map((i) => i.id)
    const noExistItems = items
      .filter((i) => !existIds.includes(i.id))
      .filter((i) => !newInstallIds.includes(i.id))

    setInputItems(noExistItems)
  }, [extensions, inputs, newInstallItems])

  useEffect(() => {
    const handler = async (info) => {
      const one = inputItems.find((i) => i.id === info.id)
      if (!one) {
        return
      }
      setInputItems((prev) => {
        return prev.filter((i) => i.id !== info.id)
      })

      setNewInstallItems((prev) => {
        return [...prev, info]
      })
    }

    chrome.management.onInstalled.addListener(handler)
    return () => {
      chrome.management.onInstalled.removeListener(handler)
    }
  }, [inputItems])

  return [inputItems]
}

function buildInputs(inputs) {
  const items = inputs
    .map((ext) => {
      if (!ext.id || !ext.name) {
        return null
      }
      return ext
    })
    .filter(Boolean)

  for (const item of items) {
    if (!item.webStoreUrl) {
      if (item.channel === "Chrome") {
        item.webStoreUrl = `https://chrome.google.com/webstore/detail/${item.id}`
      } else if (item.channel === "Edge") {
        item.webStoreUrl = `https://microsoftedge.microsoft.com/addons/detail/${item.id}`
      }
    }
  }

  return items
}
