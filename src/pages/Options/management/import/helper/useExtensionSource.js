import { memo, useState } from "react"

const searchSourceItems = [
  {
    label: "Official WebStore",
    key: "default"
  },
  {
    label: "crxsoso.com",
    key: "crxsoso"
  }
]

/**
 * 安装扩展的应用商店选择
 */
export function useExtensionSource() {
  // 扩展搜索源
  const [extensionSearchSource, setExtensionSearchSource] = useState(searchSourceItems[0])

  const handleSourceMenuClick = (e) => {
    const item = searchSourceItems.find((i) => i.key === e.key)
    if (!item) {
      return
    }
    setExtensionSearchSource(item)
  }

  const searchSourceMenuProps = {
    items: searchSourceItems,
    onClick: handleSourceMenuClick
  }

  const handleSourceClick = () => {
    if (extensionSearchSource.key === "crxsoso") {
      chrome.tabs.create({
        url: `https://www.crxsoso.com`
      })
    }
  }

  return [searchSourceMenuProps, extensionSearchSource, handleSourceClick]
}
