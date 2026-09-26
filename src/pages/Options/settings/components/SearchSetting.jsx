import React, { memo, useEffect, useState } from "react"

import {
  ChromeOutlined,
  LinkOutlined,
  QuestionCircleOutlined,
  WindowsOutlined
} from "@ant-design/icons"
import { Dropdown, Switch, Tooltip } from "antd"

import { isEdgePackage } from ".../utils/channelHelper"
import { getLang } from ".../utils/utils"

const searchSourceItems = [
  {
    label: isEdgePackage() ? "Edge" : "Chrome",
    key: "default",
    icon: isEdgePackage() ? <WindowsOutlined /> : <ChromeOutlined />
  },
  {
    label: "crxsoso",
    key: "crxsoso",
    icon: <LinkOutlined />
  }
]

const SearchSetting = memo(({ setting, onSettingChange }) => {
  // 是否总是显示搜索栏
  const [isShowSearchBar, setIsShowSearchBar] = useState(false)
  // 是否支持跳转到应用商店搜索
  const [isSupportSearchAppStore, setIsSupportSearchAppStore] = useState(false)
  // 扩展搜索源
  const [extensionSearchSource, setExtensionSearchSource] = useState(searchSourceItems[0])

  useEffect(() => {
    const showSearchBar = setting.isShowSearchBarDefault ?? false
    setIsShowSearchBar(showSearchBar)

    const supportSearchAppStore = setting.isSupportSearchAppStore ?? false
    setIsSupportSearchAppStore(supportSearchAppStore)

    const searchSource = setting.extensionSearchSource ?? ""
    setExtensionSearchSource(
      searchSourceItems.find((i) => i.key === searchSource) ?? searchSourceItems[0]
    )
  }, [setting])

  const handleSourceMenuClick = (e) => {
    const item = searchSourceItems.find((i) => i.key === e.key)
    if (!item) {
      return
    }
    setExtensionSearchSource(item)
    onSettingChange(e.key, null, "extensionSearchSource")
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
    } else if (extensionSearchSource.key === "default") {
      chrome.tabs.create({
        url: isEdgePackage()
          ? "https://microsoftedge.microsoft.com/addons"
          : "https://chromewebstore.google.com"
      })
    }
  }

  return (
    <div>
      {/* 搜索框：默认显示（未开启时点击 🔍 显示） */}
      <div className="setting-item">
        <span>
          {getLang("setting_ui_search_display")}
          <Tooltip placement="top" title={getLang("setting_ui_search_display_tip")}>
            <QuestionCircleOutlined />
          </Tooltip>{" "}
        </span>
        <Switch
          aria-label={getLang("setting_ui_search_display")}
          checked={isShowSearchBar}
          onChange={(value) =>
            onSettingChange(value, setIsShowSearchBar, "isShowSearchBarDefault")
          }></Switch>
      </div>

      {/* 搜索框：支持跳转应用商店搜索 */}
      <div className="setting-item">
        <span>
          {getLang("setting_ui_search_jump")}
          <Tooltip placement="top" title={getLang("setting_ui_search_jump_tip")}>
            <QuestionCircleOutlined />
          </Tooltip>{" "}
        </span>
        <Switch
          aria-label={getLang("setting_ui_search_jump")}
          checked={isSupportSearchAppStore}
          onChange={(value) =>
            onSettingChange(value, setIsSupportSearchAppStore, "isSupportSearchAppStore")
          }></Switch>
      </div>

      {/* 搜索源 */}
      {isSupportSearchAppStore && (
        <div className="setting-dependent">
          <div className="setting-item">
            <span>{getLang("setting_ui_search_source")}</span>

            <Dropdown.Button
              className="search-source-dropdown"
              menu={searchSourceMenuProps}
              buttonsRender={([sourceButton, menuButton]) => [
                sourceButton,
                React.cloneElement(menuButton, {
                  "aria-label": getLang("setting_ui_search_source")
                })
              ]}
              onClick={handleSourceClick}>
              {extensionSearchSource.label}
            </Dropdown.Button>
          </div>
        </div>
      )}
    </div>
  )
})

export default SearchSetting
