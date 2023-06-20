import React, { memo, useState } from "react"

import {
  BlockOutlined,
  CaretDownOutlined,
  DownOutlined,
  FolderOpenOutlined,
  SettingOutlined
} from "@ant-design/icons"
import { Button, Dropdown, Space, Tooltip, message } from "antd"

const SceneDropdown = memo(({ options, className }) => {
  const [scene, setScene] = useState(null)

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

  const handleSceneMenuClick = (e) => {
    console.log("click", e)
    console.log(e.item)

    const scene = options.scenes?.filter((s) => s.id === e.key)[0]
    setScene(scene)
  }

  const sceneMenu = {
    items: [...fixMenu, ...configMenu],
    onClick: handleSceneMenuClick
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
