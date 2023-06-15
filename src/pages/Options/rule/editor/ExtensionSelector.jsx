import React, { memo, useEffect, useState } from "react"

import { DownOutlined, PlusOutlined } from "@ant-design/icons"
import { Button, Dropdown, Input, Space, Switch, message } from "antd"

import ExtensionItems from "../../components/ExtensionItems"
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

const ExtensionSelector = memo(({ groupList, extensions }) => {
  const [matchMode, setMatchMode] = useState(matchModes[0])
  const [selectGroup, setSelectGroup] = useState(null)
  const [showingExtensions, setShowingExtensions] = useState([])

  console.log(groupList)

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
    items: groupList.map((g) => ({
      label: g.name,
      key: g.id
    })),
    onClick: (e) => {
      const selectGroup = groupList.filter((g) => g.id === e.key)[0]
      setSelectGroup(selectGroup)
      console.log(selectGroup)
      if (selectGroup) {
        if (selectGroup.extensions && selectGroup.extensions.length > 0) {
          const ext = extensions.filter((e) =>
            selectGroup.extensions.includes(e.id)
          )
          setShowingExtensions(ext)
        } else {
          setShowingExtensions([])
        }
      }
    }
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

        {matchMode?.key === "group" && (
          <div className="group-match-mode-container">
            <Dropdown menu={extGroupSelectMenuProps}>
              <Button>
                <Space>
                  {selectGroup?.name ?? "选择扩展组"}
                  <DownOutlined />
                </Space>
              </Button>
            </Dropdown>
          </div>
        )}

        <div>
          <ExtensionItems
            items={showingExtensions}
            placeholder="无任何扩展"></ExtensionItems>
        </div>
      </Style>
    </EditorCommonStyle>
  )
})

export default ExtensionSelector
