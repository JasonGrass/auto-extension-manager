import { EditFilled, PlusCircleOutlined } from "@ant-design/icons"
import { Switch, message } from "antd"
import React, { useEffect, useState } from "react"

import optionsStorage from ".../storage/options-storage"
import Title from "../Title.jsx"
import { SceneStyle } from "./SceneStyle"

function Scene({ currentScene }) {
  const sceneList = [
    {
      id: "1",
      name: "工作模式",
      desc: "工作模式下打开调试相关的插件XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
      isActive: true
    },
    { id: "2", name: "娱乐模式", desc: "", isActive: false }
  ]

  return (
    <SceneStyle>
      <Title title="情景模式"></Title>

      {currentScene ? (
        <h2>当前情景模式：{currentScene}</h2>
      ) : (
        <h2>当前没有设置任何情景模式</h2>
      )}

      <div className="scene-item-container">
        {sceneList.map((scene) => {
          return buildSceneItem(scene)
        })}
      </div>

      <div
        className="scene-item"
        style={{ display: "flex", alignItems: "center" }}>
        <h3 style={{ flexGrow: 1, fontWeight: 700 }}>新增情景模式</h3>
        <PlusCircleOutlined className="scene-item-add-icon" />
      </div>
    </SceneStyle>
  )

  function buildSceneItem(item) {
    const onChange = (e, i) => {}

    const onEditClick = (e, i) => {
      message.info(`edit ${i.name}`)
    }

    return (
      <div className="scene-item" key={item.id}>
        <div className="scene-item-header">
          <h3>{item.name}</h3>
          <Switch checked={item.isActive} onChange={(e) => onChange(e, item)} />
        </div>
        <p>{item.desc}</p>
        <EditFilled
          className="scene-item-edit-icon"
          onClick={(e) => onEditClick(e, item)}
        />
      </div>
    )
  }
}

export default Scene
