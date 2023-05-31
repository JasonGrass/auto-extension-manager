import {
  BlockOutlined,
  DownOutlined,
  FolderOpenOutlined,
  SettingOutlined
} from "@ant-design/icons"
import { Button, Dropdown, Space, Tooltip, message } from "antd"
import React, { useEffect, useState } from "react"

import "./HeaderStyle.css"

const handleProfileMenuClick = (e) => {
  message.info("Click on menu item.")
  console.log("click", e)
}

const profileMenu = {
  items: [
    {
      label: "1st menu item",
      key: "1",
      icon: <BlockOutlined />
    },
    {
      label: "2nd menu item",
      key: "2",
      icon: <BlockOutlined />
    }
  ],
  onClick: handleProfileMenuClick
}

const handleGroupMenuClick = (e) => {
  message.info("Click on menu item.")
  console.log("click", e)
}

const groupMenu = {
  items: [
    {
      label: "全部",
      key: "1",
      icon: <FolderOpenOutlined />
    },
    {
      label: "未分组",
      key: "2",
      icon: <FolderOpenOutlined />
    }
  ],
  onClick: handleGroupMenuClick
}

const handleSettingButtonClick = (e) => {
  chrome.management.getSelf((self) => {
    chrome.tabs.create({ url: self.optionsUrl })
  })
}

function Header({ activeCount, totalCount, options }) {
  const [initialize, setInitialize] = useState(true)
  useEffect(() => {
    setInitialize(false)
  }, [])

  return (
    <div className="header">
      <div className="left">
        <h2>
          🍀 {activeCount}/{totalCount}
        </h2>
      </div>

      {buildOperationButton()}
    </div>
  )

  function buildOperationButton() {
    if (initialize) {
      return null
    } else {
      return (
        <div className="right">
          <Dropdown menu={profileMenu}>
            <Button>
              <Space>
                情景模式
                <DownOutlined />
              </Space>
            </Button>
          </Dropdown>

          <Dropdown menu={groupMenu}>
            <Button>
              <Space>
                插件分组
                <DownOutlined />
              </Space>
            </Button>
          </Dropdown>
          <Tooltip title="设置">
            <Button
              icon={<SettingOutlined />}
              onClick={(e) => handleSettingButtonClick(e)}
            />
          </Tooltip>
        </div>
      )
    }
  }
}

export default Header
