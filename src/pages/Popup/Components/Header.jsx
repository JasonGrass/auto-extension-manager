import React, { memo, useEffect, useRef, useState } from "react"

import { SearchOutlined, SettingOutlined } from "@ant-design/icons"
import Icon from "@ant-design/icons/lib/components/Icon"
import { Space } from "antd"

import EdgeIcon from ".../assets/img/Microsoft_Store.svg"
import ChromeWebStoreIcon from ".../assets/img/chrome-web-store-icon.svg"
import DarkIcon from ".../assets/img/design-devin/AEM-Logo-Dark.svg"
import LightIcon from ".../assets/img/design-devin/AEM-Logo-Light.svg"
import storage from ".../storage/sync"
import { isEdgePackage } from ".../utils/channelHelper"
import Style, { SearchStyle } from "./HeaderStyle"
import GroupDropdown from "./header/GroupDropdown"
import SceneDropdown from "./header/SceneDropdown"

const Header = memo((props) => {
  const {
    activeCount,
    totalCount,
    options,
    onGroupChanged,
    onLayoutChanged,
    onSearch,
    isDarkMode
  } = props

  // 是否显示操作菜单，用于控制延迟渲染
  const [isShowOperations, setIsShowOperations] = useState(false)
  // 是否显示搜索框
  const [isShowSearch, setIsShowSearch] = useState(options.setting.isShowSearchBarDefault)
  // 布局样式
  const [layout, setLayout] = useState(options.setting.layout)

  const [searchText, setSearchText] = useState("")
  const searchInputRef = useRef(null)

  useEffect(() => {
    setIsShowOperations(true)
  }, [])

  useEffect(() => {
    if (isShowSearch) {
      searchInputRef.current.focus()
    }
  }, [isShowSearch])

  // layout 变更时，保存配置
  useEffect(() => {
    storage.options.getAll().then((options) => {
      const setting = { ...options.setting, layout: layout }
      storage.options.set({ setting: setting })
    })
  }, [layout])

  const onSearchClick = () => {
    const show = !isShowSearch
    setIsShowSearch(show)
    if (!show) {
      setSearchText("")
    }
  }

  const onLayoutClick = () => {
    if (!layout || layout === "list") {
      setLayout("grid")
      onLayoutChanged("grid")
    } else {
      setLayout("list")
      onLayoutChanged("list")
    }
  }

  const onSettingClick = (e) => {
    chrome.management.getSelf((self) => {
      chrome.tabs.create({ url: self.optionsUrl })
    })
  }

  const onSearchTextChange = (e) => {
    const text = e.target.value
    setSearchText(text)
    onSearch?.(text)
  }

  useEffect(() => {
    const onKeydown = (e) => {
      switch (e.key) {
        case "f":
          if (!isShowSearch) {
            setIsShowSearch(true)
            e.preventDefault()
          }
          return
        case "s":
          if (isShowSearch) {
            return
          }
          onSettingClick(e)
          e.preventDefault()
          return
        default:
          return
      }
    }

    document.addEventListener("keydown", onKeydown)
    return () => {
      document.removeEventListener("keydown", onKeydown)
    }
  }, [isShowSearch])

  /**
   * 应用商店搜索
   */
  const onStoreSearch = () => {
    if (!options.setting.isSupportSearchAppStore) {
      return
    }

    if (!searchText || searchText.trim() === "") {
      return
    }

    const source = options.setting.extensionSearchSource
    if (source === "crxsoso") {
      chrome.tabs.create({
        url: `https://www.crxsoso.com/search?keyword=${searchText.trim()}`
      })
    }
    // 默认搜索
    else {
      if (isEdgePackage()) {
        chrome.tabs.create({
          url: `https://microsoftedge.microsoft.com/addons/search/${searchText.trim()}`
        })
      } else {
        chrome.tabs.create({ url: `https://chromewebstore.google.com/search/${searchText.trim()}` })
      }
    }
  }

  /**
   * 构建应用商店搜索的按钮图标
   */
  const buildStoreSearchIcon = () => {
    if (!options.setting.isSupportSearchAppStore) {
      return
    }
    if (!searchText || searchText.trim() === "") {
      return null
    }

    return isEdgePackage() ? (
      <img
        src={EdgeIcon}
        className="store-icon edge-store-icon"
        alt="edge icon"
        onClick={(e) => onStoreSearch()}
      />
    ) : (
      <img
        src={ChromeWebStoreIcon}
        className="store-icon chrome-store-icon"
        alt="chrome web store icon"
        onClick={(e) => onStoreSearch()}
      />
    )
  }

  return (
    <>
      <Style>
        <div className="left">
          <img src={isDarkMode ? DarkIcon : LightIcon} alt="" />
          <h2>
            {activeCount}/{totalCount}
          </h2>
        </div>

        {isShowOperations && (
          <div className="right">
            <SceneDropdown className="dropdown" options={options}></SceneDropdown>

            <GroupDropdown
              className="dropdown"
              options={options}
              onGroupChanged={onGroupChanged}></GroupDropdown>

            <Space className="search setting-icon" onClick={onSearchClick}>
              <SearchOutlined />
            </Space>

            <Space className="layout setting-icon" onClick={onLayoutClick}>
              <Icon component={LayoutSvg}></Icon>
            </Space>

            <Space className="setting setting-icon" onClick={(e) => onSettingClick(e)}>
              <SettingOutlined />
            </Space>
          </div>
        )}
      </Style>

      {isShowSearch && (
        <SearchStyle>
          <input
            type="text"
            placeholder="Search"
            value={searchText}
            onChange={(e) => onSearchTextChange(e)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                onStoreSearch()
              }
            }}
            ref={searchInputRef}></input>
          {buildStoreSearchIcon()}
        </SearchStyle>
      )}
    </>
  )
})

export default Header

const LayoutSvg = () => (
  <svg
    t="1692520761982"
    viewBox="0 0 1124 1124"
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
    p-id="4835"
    fill="currentColor"
    aria-hidden="true"
    width="1em"
    height="1em">
    <path
      d="M896 298.666667H128a128 128 0 0 1-128-128V128a128 128 0 0 1 128-128h768a128 128 0 0 1 128 128v42.666667a128 128 0 0 1-128 128zM128 85.333333a42.666667 42.666667 0 0 0-42.666667 42.666667v42.666667a42.666667 42.666667 0 0 0 42.666667 42.666666h768a42.666667 42.666667 0 0 0 42.666667-42.666666V128a42.666667 42.666667 0 0 0-42.666667-42.666667zM213.333333 1024H128a128 128 0 0 1-128-128v-384a128 128 0 0 1 128-128h85.333333a128 128 0 0 1 128 128v384a128 128 0 0 1-128 128zM128 469.333333a42.666667 42.666667 0 0 0-42.666667 42.666667v384a42.666667 42.666667 0 0 0 42.666667 42.666667h85.333333a42.666667 42.666667 0 0 0 42.666667-42.666667v-384a42.666667 42.666667 0 0 0-42.666667-42.666667zM896 1024h-341.333333a128 128 0 0 1-128-128v-384a128 128 0 0 1 128-128h341.333333a128 128 0 0 1 128 128v384a128 128 0 0 1-128 128z m-341.333333-554.666667a42.666667 42.666667 0 0 0-42.666667 42.666667v384a42.666667 42.666667 0 0 0 42.666667 42.666667h341.333333a42.666667 42.666667 0 0 0 42.666667-42.666667v-384a42.666667 42.666667 0 0 0-42.666667-42.666667z"
      p-id="4836"></path>
  </svg>
)
