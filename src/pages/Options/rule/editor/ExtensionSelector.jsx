import React, { memo, useEffect, useState } from "react"

import { DownOutlined, PlusOutlined } from "@ant-design/icons"
import { Button, Dropdown, Input, Space, Switch, message } from "antd"

import EditorCommonStyle from "./CommonStyle"
import Style from "./ExtensionSelectorStyle"

const matchModes = [
  {
    label: "扩展",
    key: "single"
  },
  {
    label: "扩展组",
    key: "group"
  }
]

const ExtensionSelector = memo(() => {
  const [matchMode, setMatchMode] = useState(matchModes[0])

  const handleMatchModeClick = (e) => {
    const mode = matchModes.filter((m) => m.key === e.key)[0]
    if (!mode) {
      return
    }
    setMatchMode(mode)
  }

  const matchModeMenuProps = {
    items: matchModes,
    onClick: handleMatchModeClick
  }

  const extGroupSelectMenuProps = {
    items: []
  }

  return (
    <EditorCommonStyle>
      <Style>
        <div className="header">
          <span className="title">扩展（组）</span>
          <div>
            <Dropdown.Button menu={matchModeMenuProps}>
              <span style={{ width: 60 }}>{matchMode.label}</span>
            </Dropdown.Button>
          </div>
        </div>

        <div className="group-match-mode-container">
          <Dropdown menu={extGroupSelectMenuProps}>
            <Button>
              <Space>
                选择扩展组
                <DownOutlined />
              </Space>
            </Button>
          </Dropdown>
        </div>
      </Style>
    </EditorCommonStyle>
  )
})

export default ExtensionSelector
