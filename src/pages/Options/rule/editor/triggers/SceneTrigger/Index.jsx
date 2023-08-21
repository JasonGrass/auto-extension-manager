import React, { forwardRef, memo, useEffect, useImperativeHandle, useState } from "react"

import { ClearOutlined, DownOutlined, PlusOutlined } from "@ant-design/icons"
import { Alert, Button, Dropdown, Space } from "antd"
import { styled } from "styled-components"

const SceneTrigger = ({ options, config }, ref) => {
  const sceneList = options.scenes

  useImperativeHandle(ref, () => ({
    getSceneTriggerConfig: () => {
      if (!matchScene?.id) {
        throw Error("没有选择任何情景模式")
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
    return <p>没有创建任何情景模式，请先创建</p>
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
      <Alert message="选择需要匹配的情景模式" type="info" showIcon />

      <div className="scene-select-dropdown">
        <Dropdown menu={sceneListMenuProps}>
          <Button>
            <Space>
              {matchScene?.name ?? "选择情景模式"}
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
