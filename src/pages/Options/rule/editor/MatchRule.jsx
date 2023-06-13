import React, { memo, useEffect, useState } from "react"

import { DownOutlined, PlusOutlined } from "@ant-design/icons"
import { Button, Dropdown, Input, Space, Switch, message } from "antd"

import EditorCommonStyle from "./CommonStyle"
import Style from "./MatchRuleStyle"

const matchModes = [
  {
    label: "域名",
    key: "host"
  },
  {
    label: "情景模式",
    key: "scene"
  }
]

const matchMethods = [
  {
    label: "通配符",
    key: "wildcard"
  },
  {
    label: "正则表达式",
    key: "regex"
  }
]

const MatchRule = memo(() => {
  const [matchMode, setMatchMode] = useState(matchModes[0])
  const [matchMethod, setMatchMethod] = useState(matchMethods[0])

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

  const onMatchMethodSwitchChanged = (e) => {
    if (e) {
      setMatchMethod(matchMethods[1])
    } else {
      setMatchMethod(matchMethods[0])
    }
  }

  return (
    <EditorCommonStyle>
      <Style>
        <div className="header">
          <span className="title">匹配</span>
          <div>
            <Dropdown.Button menu={matchModeMenuProps}>
              <span style={{ width: 60 }}>{matchMode.label}</span>
            </Dropdown.Button>
          </div>

          <div className="match-method">
            <span className="match-method-title">是否使用正则</span>
            <Switch
              size="small"
              checked={matchMethod.key === "regex"}
              onChange={(e) => onMatchMethodSwitchChanged(e)}
            />
            <span className="match-method-label">
              匹配方式: {matchMethod.label}
            </span>
          </div>
        </div>

        <div className="scene-match-mode-container">
          <Dropdown menu={matchModeMenuProps}>
            <Button>
              <Space>
                选择情景模式
                <DownOutlined />
              </Space>
            </Button>
          </Dropdown>
        </div>

        <div className="host-match-mode-container">
          <Input addonBefore="http(s)://" />
          <Input addonBefore="http(s)://" />
          <Input addonBefore="http(s)://" />
          <Button>
            <Space>
              添加域名
              <PlusOutlined />
            </Space>
          </Button>
        </div>
      </Style>
    </EditorCommonStyle>
  )
})

export default MatchRule
