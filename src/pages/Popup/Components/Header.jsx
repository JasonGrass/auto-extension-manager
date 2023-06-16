import React, { useEffect, useState } from "react"

import {
  BlockOutlined,
  CaretDownOutlined,
  DownOutlined,
  FolderOpenOutlined,
  SettingOutlined
} from "@ant-design/icons"
import { Button, Dropdown, Space, Tooltip, message } from "antd"

import MainIcon from "../../../assets/img/icon-64.png"
import "./Header.less"
import GroupDropdown from "./header/GroupDropdown"
import SceneDropdown from "./header/SceneDropdown"

const handleSettingButtonClick = (e) => {
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
    <div className="header">
      <div className="left">
        <img src={MainIcon} alt="" />
        <h2>
          {activeCount}/{totalCount}
        </h2>
      </div>

      {isShowOperations && (
        <div className="right">
          <SceneDropdown options={options}></SceneDropdown>

          <GroupDropdown
            options={options}
            onGroupChanged={onGroupChanged}></GroupDropdown>

          <Space
            className="setting"
            onClick={(e) => handleSettingButtonClick(e)}>
            <SettingOutlined />
          </Space>
        </div>
      )}
    </div>
  )
}

export default Header
