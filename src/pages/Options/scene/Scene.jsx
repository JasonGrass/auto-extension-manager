import { DeleteFilled, EditFilled, PlusCircleOutlined } from "@ant-design/icons"
import { Popconfirm, Switch, message } from "antd"
import React, { useEffect, useState } from "react"

import { SceneOptions } from ".../storage/index"
import { isStringEmpty } from ".../utils/utils.js"
import Title from "../Title.jsx"
import SceneEditor from "./SceneEditor.jsx"
import { SceneStyle } from "./SceneStyle"

/*
    {
      id: "1",
      name: "工作模式",
      desc: "描述",
      isActive: true
    }
*/

function Scene() {
  const [sceneList, setSceneList] = useState([])
  const [itemEditInfo, setItemEditInfo] = useState({})
  const [itemEditType, setItemEditType] = useState("")
  const [activeScene, setActiveScene] = useState(null)
  const [messageApi, contextHolder] = message.useMessage()
  useEffect(() => {
    fetchScene()
  })

  async function fetchScene() {
    const all = await SceneOptions.getAll()
    all.forEach((i) => (i.isActive = false))
    const activeId = await SceneOptions.getActive()
    const activeItem = all.find((i) => i.id === activeId)
    if (activeItem) {
      activeItem.isActive = true
    }
    setActiveScene(activeItem)
    setSceneList(all)
  }

  const onNewSceneClick = (e) => {
    setItemEditInfo({})
    setItemEditType("new")
  }

  const editCallback = async (editType, info) => {
    if (editType === "cancel") {
      setItemEditType("")
      return
    }

    try {
      if (isStringEmpty(info.name)) {
        throw Error("name cannot be empty")
      }

      if (editType === "new") {
        await SceneOptions.addOne(info)
        await fetchScene()
      } else if (editType === "edit") {
        await SceneOptions.update(info)
        await fetchScene()
      }
      setItemEditType("")
    } catch (error) {
      messageApi.open({
        type: "error",
        content: error.message
      })
    }
  }

  return (
    <SceneStyle>
      <Title title="情景模式"></Title>
      {contextHolder}
      {activeScene ? (
        <h2>当前情景模式：{activeScene.name}</h2>
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
        <PlusCircleOutlined
          onClick={(e) => onNewSceneClick(e)}
          className="scene-item-add-icon"
        />
      </div>

      <div
        className="scene-edit-panel"
        style={{ display: itemEditType !== "" ? "block" : "none" }}>
        <SceneEditor
          editType={itemEditType}
          sceneInfo={itemEditInfo}
          editCallback={editCallback}></SceneEditor>
      </div>
    </SceneStyle>
  )

  function buildSceneItem(item) {
    const onActiveChange = async (e, i) => {
      if (e) {
        await SceneOptions.setActive(i.id)
        setActiveScene(i)
      } else {
        await SceneOptions.setActive("")
        setActiveScene(null)
      }
    }

    const onEditClick = (e, i) => {
      setItemEditInfo(i)
      setItemEditType("edit")
    }

    const onDeleteClick = async (e, i) => {
      await SceneOptions.deleteOne(i.id)
      await fetchScene()
    }

    return (
      <div className="scene-item" key={item.id}>
        <div className="scene-item-header">
          <h3>{item.name}</h3>
          <Switch
            checked={item.isActive}
            onChange={(e) => onActiveChange(e, item)}
          />
        </div>
        <p>{item.desc}</p>

        <div className="scene-item-edit-icon">
          <EditFilled
            style={{ marginRight: 8 }}
            onClick={(e) => onEditClick(e, item)}
          />
          <Popconfirm
            title="删除"
            description={`确认删除"${item.name}"`}
            onConfirm={(e) => onDeleteClick(e, item)}
            onCancel={(e) => e.stopPropagation()}
            okText="Yes"
            cancelText="Cancel"
            onClick={(e) => e.stopPropagation()}>
            <DeleteFilled />
          </Popconfirm>
        </div>
      </div>
    )
  }
}

export default Scene
