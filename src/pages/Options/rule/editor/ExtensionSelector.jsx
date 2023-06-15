import React, { memo, useEffect, useState } from "react"

import { DownOutlined, PlusOutlined } from "@ant-design/icons"
import { Button, Dropdown, Input, Space, Switch, message } from "antd"

import { sortExtension } from ".../utils/extensionHelper"
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
  const [selectedExtensions, setSelectedExtensions] = useState([])
  const [unselectedExtensions, setUnselectedExtensions] = useState([])

  useEffect(() => {
    setUnselectedExtensions(extensions)
  }, [extensions])

  const handleMatchModeClick = (e) => {
    const mode = matchModes.filter((m) => m.key === e.key)[0]
    if (!mode) {
      return
    }
    if (mode.key === matchMode.key) {
      return
    }

    setMatchMode(mode)
    if (mode.key === "single") {
      setSelectedExtensions([])
      setUnselectedExtensions(extensions)
    } else if (mode.key === "group") {
      setSelectedExtensionsByGroup(selectGroup)
    }
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
      setSelectedExtensionsByGroup(selectGroup)
    }
  }

  const onSelectedExtensionClick = (e, item) => {
    if (matchMode.key === "single") {
      const selected = selectedExtensions.filter((e) => e.id !== item.id)
      setSelectedExtensions(selected)

      const unselected = [...unselectedExtensions, item]
      setUnselectedExtensions(sortExtension(unselected))
    }
  }

  const onUnselectedExtensionClick = (e, item) => {
    if (matchMode.key === "single") {
      const unselected = unselectedExtensions.filter((e) => e.id !== item.id)
      setUnselectedExtensions(unselected)

      const selected = [...selectedExtensions, item]
      setSelectedExtensions(sortExtension(selected))
    }
  }

  function setSelectedExtensionsByGroup(selectGroup) {
    if (selectGroup) {
      if (selectGroup.extensions && selectGroup.extensions.length > 0) {
        const ext = extensions.filter((e) =>
          selectGroup.extensions.includes(e.id)
        )
        setSelectedExtensions(ext)
      } else {
        setSelectedExtensions([])
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

        <div className="extension-container">
          <h3>包含的扩展</h3>
          <ExtensionItems
            items={selectedExtensions}
            placeholder="无任何扩展"
            onClick={onSelectedExtensionClick}></ExtensionItems>

          {matchMode?.key === "single" && (
            <div className="unselected-extensions-container">
              <h3>未包含的扩展</h3>
              <ExtensionItems
                items={unselectedExtensions}
                placeholder="无任何扩展"
                onClick={onUnselectedExtensionClick}></ExtensionItems>
            </div>
          )}
        </div>
      </Style>
    </EditorCommonStyle>
  )
})

export default ExtensionSelector
