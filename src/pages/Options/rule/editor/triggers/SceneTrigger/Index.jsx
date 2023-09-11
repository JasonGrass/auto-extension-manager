import React, { forwardRef, memo, useEffect, useImperativeHandle, useState } from "react"

import { ClearOutlined, DownOutlined, PlusOutlined } from "@ant-design/icons"
import { Alert, Button, Dropdown, Space } from "antd"
import { styled } from "styled-components"

import { getLang } from ".../utils/utils"

const SceneTrigger = ({ options, config }, ref) => {
  const sceneList = options.scenes

  useImperativeHandle(ref, () => ({
    getSceneTriggerConfig: () => {
      if (!matchScene?.id) {
        throw Error(getLang("trigger_scene_no_any"))
      }

      return {
        sceneId: matchScene?.id
      }
    }
  }))

  // 匹配情景模式 ID
  const [matchScene, setMatchScene] = useState({})

  useEffect(() => {
    const myConfig = config.match?.triggers?.find((t) => t.trigger === "sceneTrigger")?.config ?? {}
    const sceneId = myConfig?.sceneId ?? ""
    setMatchScene(sceneList.find((s) => s.id === sceneId))
  }, [options, sceneList, config])

  if (!sceneList || sceneList.length === 0) {
    return <p>{getLang("trigger_scene_no_created")}</p>
  }

  const sceneListMenuProps = {
    items: sceneList.map((scene) => ({
      key: scene.id,
      label: scene.name
    })),
    onClick: (e) => {
      // 用户选择的情景模式
      const selectScene = sceneList.filter((m) => m.id === e.key)[0]
      setMatchScene(selectScene)
    }
  }

  return (
    <Style>
      <Alert message={getLang("trigger_scene_select_one")} type="info" showIcon />

      <div className="scene-select-dropdown">
        <Dropdown menu={sceneListMenuProps}>
          <Button>
            <Space>
              {matchScene?.name ?? getLang("trigger_scene_select_tip")}
              <DownOutlined />
            </Space>
          </Button>
        </Dropdown>
      </div>
    </Style>
  )
}

export default memo(forwardRef(SceneTrigger))

const Style = styled.div`
  .scene-select-dropdown {
    margin-top: 5px;
  }
`
