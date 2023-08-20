import React, { memo, useEffect, useRef, useState } from "react"

import { LayoutOutlined, SearchOutlined, SettingOutlined } from "@ant-design/icons"
import { Space } from "antd"

import { OptionsStorage, SyncOptionsStorage } from ".../storage"
import MainIcon from "../../../assets/img/icon-64.png"
import Style, { SearchStyle } from "./HeaderStyle"
import GroupDropdown from "./header/GroupDropdown"
import SceneDropdown from "./header/SceneDropdown"

const Header = memo((props) => {
  const { activeCount, totalCount, options, onGroupChanged, onLayoutChanged, onSearch } = props

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
    SyncOptionsStorage.getAll().then((options) => {
      const setting = { ...options.setting, layout: layout }
      OptionsStorage.set({ setting: setting })
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

  return (
    <>
      <Style>
        <div className="left">
          <img src={MainIcon} alt="" />
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
              <LayoutOutlined />
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
            ref={searchInputRef}></input>
        </SearchStyle>
      )}
    </>
  )
})

export default Header
