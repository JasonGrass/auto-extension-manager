import React, { memo, useEffect, useState } from "react"

import { CaretDownOutlined } from "@ant-design/icons"
import { Dropdown } from "antd"

import { LocalOptions } from ".../storage/local"
import { sendMessage } from ".../utils/messageHelper"
import { getLang } from ".../utils/utils"
import { MenuStyle } from "./MenuStyle"

const SceneDropdown = memo(({ options, className }) => {
  const [scene, setScene] = useState(null)
  useEffect(() => {
    const local = new LocalOptions()
    local.getActiveSceneId().then((activeId) => {
      if (activeId) {
        setScene(options.scenes?.find((s) => s.id === activeId))
      }
    })
  }, [options])

  const fixMenu = [
    {
      label: getLang("scene_cancel_all"),
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
      <Dropdown menu={sceneMenu} trigger={["hover"]} placement="bottomLeft">
        <MenuStyle>
          <span className="content">
            <span className="menu-item-text">{scene?.name ?? getLang("scene_title")}</span>
            <CaretDownOutlined className="caret" />
          </span>
        </MenuStyle>
      </Dropdown>
    </div>
  )
})

export default SceneDropdown
