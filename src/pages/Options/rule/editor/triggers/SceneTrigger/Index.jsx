import React, { forwardRef, memo, useEffect, useImperativeHandle, useState } from "react"

import CheckableTag from "antd/es/tag/CheckableTag"

import { Alert } from "antd"
import { styled } from "styled-components"

import { getLang } from ".../utils/utils"

const SceneTrigger = ({ options, config }, ref) => {
  const sceneList = options.scenes

  useImperativeHandle(ref, () => ({
    getSceneTriggerConfig: () => {
      if (selectedSceneIds.length < 1) {
        throw Error(getLang("trigger_scene_no_any"))
      }

      return {
        sceneId: undefined, // 清空旧的配置数据
        sceneIds: selectedSceneIds
      }
    }
  }))

  // 匹配情景模式 ID
  const [selectedSceneIds, setSelectedSceneIds] = useState([])

  // 初始化
  useEffect(() => {
    const myConfig = config.match?.triggers?.find((t) => t.trigger === "sceneTrigger")?.config ?? {}
    const sceneId = myConfig?.sceneId ?? ""
    const sceneIds = myConfig?.sceneIds ?? []

    if (sceneIds.length < 1 && sceneId) {
      sceneIds.push(sceneId)
    }

    setSelectedSceneIds(sceneIds)
  }, [config])

  if (!sceneList || sceneList.length === 0) {
    return <p>{getLang("trigger_scene_no_created")}</p>
  }

  const handleSceneSelect = (id, checked) => {
    const nextSelectedIds = checked
      ? [...selectedSceneIds, id]
      : selectedSceneIds.filter((t) => t !== id)
    setSelectedSceneIds(nextSelectedIds)
  }

  return (
    <Style>
      <Alert message={getLang("trigger_scene_select_one")} type="info" showIcon />

      <div className="scene-select-container">
        {sceneList.map((scene) => {
          return (
            <CheckableTag
              key={scene.id}
              checked={selectedSceneIds.includes(scene.id)}
              onChange={(checked) => handleSceneSelect(scene.id, checked)}>
              {scene.name}
            </CheckableTag>
          )
        })}
      </div>
    </Style>
  )
}

export default memo(forwardRef(SceneTrigger))

const Style = styled.div`
  .scene-select-container {
    margin: 10px 0;

    & > span {
      margin: 4px 4px;
    }
  }

  .ant-tag-checkable-checked {
    background-color: #108ee9;
  }
`
