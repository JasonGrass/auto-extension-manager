import React, { memo, useEffect, useMemo, useRef, useState } from "react"

import { CaretDownOutlined } from "@ant-design/icons"
import { Dropdown } from "antd"
import { styled } from "styled-components"

import storage from ".../storage/sync"
import { sendMessage } from ".../utils/messageHelper"
import { getLang } from ".../utils/utils"
import { MenuStyle } from "./MenuStyle"
import SceneStateToggle from "./SceneStateToggle"

const SceneDropdown = memo(({ options, className }) => {
  const [activeSceneIds, setActiveSceneIds] = useState([])
  const [isUpdating, setIsUpdating] = useState(false)
  const pendingRef = useRef(false)

  useEffect(() => {
    storage.scene.getActiveIds().then(setActiveSceneIds)
  }, [options])

  const fixMenu = [
    {
      label: getLang("scene_cancel_all"),
      key: "cancel",
      disabled: activeSceneIds.length === 0
    }
  ]

  const notifyRules = async (ids) => {
    await sendMessage("current-scenes-changed", { ids })
  }

  const setSceneActive = async (scene, active) => {
    if (!scene || pendingRef.current) {
      return
    }

    pendingRef.current = true
    setIsUpdating(true)
    try {
      const exclusive = options.setting.isActivateCurrentSceneAndDisableOthers ?? false
      const nextIds = await storage.scene.setActiveState(scene.id, active, exclusive)
      setActiveSceneIds(nextIds)
      await notifyRules(nextIds)
    } catch (error) {
      console.error("change current active scenes failed", error)
    } finally {
      pendingRef.current = false
      setIsUpdating(false)
    }
  }

  const configMenu =
    options.scenes?.map((scene) => {
      const active = activeSceneIds.includes(scene.id)
      return {
        label: (
          <SceneMenuItem>
            <span className="scene-name">{scene.name}</span>
            <SceneStateToggle
              active={active}
              loading={isUpdating}
              sceneName={scene.name}
              ariaLabel={getLang("popup_scene_toggle_tip", scene.name)}
              onChange={(checked) => setSceneActive(scene, checked)}
            />
          </SceneMenuItem>
        ),
        key: scene.id,
        title: scene.name,
        className: "state-toggle-dropdown-menu-item"
      }
    }) ?? []

  const handleSceneMenuClick = async (e) => {
    if (pendingRef.current) {
      return
    }

    if (e.key === "cancel") {
      const nextIds = await storage.scene.setActiveIds([])
      setActiveSceneIds(nextIds)
      await notifyRules(nextIds)
      return
    }

    const scene = options.scenes?.find((item) => item.id === e.key)
    await setSceneActive(scene, !activeSceneIds.includes(e.key))
  }

  const activeScenes = useMemo(
    () => options.scenes?.filter((scene) => activeSceneIds.includes(scene.id)) ?? [],
    [activeSceneIds, options.scenes]
  )
  const menuTitle =
    activeScenes.length === 0
      ? getLang("scene_title")
      : activeScenes.length === 1
        ? activeScenes[0].name
        : getLang("scene_active_count", activeScenes.length.toString())

  const sceneMenu = {
    items: [...fixMenu, ...configMenu],
    onClick: handleSceneMenuClick,
    style: { maxHeight: "none", overflowY: "visible" }
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
            <span className="menu-item-text">{menuTitle}</span>
            <CaretDownOutlined className="caret" />
          </span>
        </MenuStyle>
      </Dropdown>
    </div>
  )
})

export default SceneDropdown

const SceneMenuItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  width: 210px;

  .scene-name {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`
