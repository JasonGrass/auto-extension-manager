import React, { memo, useEffect, useState } from "react"

import { DownOutlined, PlusOutlined } from "@ant-design/icons"
import { Button, Dropdown, Input, Space, Switch, message } from "antd"

import EditorCommonStyle from "./CommonStyle"
import Style from "./RuleActionStyle"

const actionSelections = [
  {
    label: "匹配后关闭",
    key: "closeWhenMatched"
  },
  {
    label: "匹配后打开",
    key: "openWhenMatched"
  },
  {
    label: "匹配才关闭",
    key: "closeOnlyWhenMatched"
  },
  {
    label: "匹配才打开",
    key: "openOnlyWhenMatched"
  }
]

const RuleAction = memo(() => {
  const [actionType, setActionType] = useState(actionSelections[0])

  const handleActionTypeClick = (e) => {
    const mode = actionSelections.filter((m) => m.key === e.key)[0]
    if (!mode) {
      return
    }
    setActionType(mode)
  }

  const actionSelectMenuProps = {
    items: actionSelections,
    onClick: handleActionTypeClick
  }

  return (
    <EditorCommonStyle>
      <Style>
        <div className="header">
          <span className="title">动作</span>
        </div>

        <div className="action-container">
          <Dropdown menu={actionSelectMenuProps}>
            <Button>
              <Space>
                {actionType.label}
                <DownOutlined />
              </Space>
            </Button>
          </Dropdown>
        </div>
      </Style>
    </EditorCommonStyle>
  )
})

export default RuleAction
