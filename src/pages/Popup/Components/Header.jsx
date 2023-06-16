import React, { useEffect, useRef, useState } from "react"

import {
  BlockOutlined,
  CaretDownOutlined,
  DownOutlined,
  FolderOpenOutlined,
  SearchOutlined,
  SettingOutlined
} from "@ant-design/icons"
import { Button, Dropdown, Space, Tooltip, message } from "antd"

import MainIcon from "../../../assets/img/icon-64.png"
import Style, { SearchStyle } from "./HeaderStyle"
import GroupDropdown from "./header/GroupDropdown"
import SceneDropdown from "./header/SceneDropdown"

function Header({
  activeCount,
  totalCount,
  options,
  onGroupChanged,
  onSearch
}) {
  const [isShowOperations, setIsShowOperations] = useState(false)
  const [isShowSearch, setIsShowSearch] = useState(false)
  const [searchText, setSearchText] = useState("")
  const searchInputRef = useRef(null)

  useEffect(() => {
    setIsShowOperations(true)
  }, [])

  const onSearchClick = () => {
    const show = !isShowSearch
    setIsShowSearch(show)
    if (show) {
      searchInputRef.current.focus()
    } else {
      setSearchText("")
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
            <SceneDropdown
              className="dropdown"
              options={options}></SceneDropdown>

            <GroupDropdown
              className="dropdown"
              options={options}
              onGroupChanged={onGroupChanged}></GroupDropdown>

            <Space className="search" onClick={onSearchClick}>
              <SearchOutlined />
            </Space>

            <Space className="setting" onClick={(e) => onSettingClick(e)}>
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
}

export default Header
