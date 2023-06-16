import React, { useEffect, useState } from "react"

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
import Style from "./HeaderStyle"
import GroupDropdown from "./header/GroupDropdown"
import SceneDropdown from "./header/SceneDropdown"

const onSettingClick = (e) => {
  chrome.management.getSelf((self) => {
    chrome.tabs.create({ url: self.optionsUrl })
  })
}

function Header({ activeCount, totalCount, options, onGroupChanged }) {
  const [isShowOperations, setIsShowOperations] = useState(false)

  useEffect(() => {
    setIsShowOperations(true)
  }, [])

  return (
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

          <Space className="search">
            <SearchOutlined />
          </Space>

          <Space className="setting" onClick={(e) => onSettingClick(e)}>
            <SettingOutlined />
          </Space>
        </div>
      )}
    </Style>
  )
}

export default Header
