import React, { memo, useEffect, useState } from "react"

import { CaretDownOutlined } from "@ant-design/icons"
import { Dropdown, Space } from "antd"

import { sendMessage } from ".../utils/messageHelper"

const SceneDropdown = memo(({ options, className }) => {
  const [scene, setScene] = useState(null)
  useEffect(() => {
    const activeId = options.local.scene?.activeId
    if (activeId) {
      setScene(options.scenes?.filter((s) => s.id === activeId)[0])
    }
  }, [options])

  const fixMenu = [
    {
      label: "取消所有",
      key: "cancel"
    }
  ]

  const configMenu =
    options.scenes?.map((scene) => ({
      label: scene.name,
      key: scene.id
    })) ?? []

  const handleSceneMenuClick = async (e) => {
    const scene = options.scenes?.filter((s) => s.id === e.key)[0]
    setScene(scene)

    try {
      await sendMessage("current-scene-changed", scene)
    } catch (error) {
      console.error("change current scene failed", error)
    }
  }

  const sceneMenu = {
    items: [...fixMenu, ...configMenu],
    onClick: handleSceneMenuClick
  }

  if (configMenu.length === 0) {
    // 没有情景模式数据，隐藏切换菜单
    return null
  }

  return (
    <div className={className}>
      <Dropdown menu={sceneMenu} trigger={["click"]} placement="bottomRight">
        <Space>
          <span className="menu-item-text">{scene?.name ?? "情景模式"}</span>
          <CaretDownOutlined className="caret" />
        </Space>
      </Dropdown>
    </div>
  )
})

export default SceneDropdown
