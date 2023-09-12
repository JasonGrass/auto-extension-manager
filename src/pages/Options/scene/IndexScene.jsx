import React, { memo, useEffect, useState } from "react"

import { DeleteFilled, EditFilled, PlusCircleOutlined } from "@ant-design/icons"
import { Popconfirm, Switch, message } from "antd"
import classNames from "classnames"

import { SceneOptions } from ".../storage/index"
import { sendMessage } from ".../utils/messageHelper.js"
import { getLang, isStringEmpty } from ".../utils/utils.js"
import Title from "../Title.jsx"
import { SceneStyle } from "./IndexSceneStyle.js"
import SceneEditor from "./SceneEditor.jsx"

/*
    {
      id: "1",
      name: "工作模式",
      desc: "描述",
      isActive: true
    }
*/

function Scene() {
  // 情景模式列表
  const [sceneList, setSceneList] = useState([])
  // 正在编辑的情景模式
  const [itemEditInfo, setItemEditInfo] = useState({})
  // 编辑状态：新建、更新、没有在编辑
  const [itemEditType, setItemEditType] = useState("")
  // 当前激活的情景模式
  const [activeScene, setActiveScene] = useState(null)
  // 当前选中的情景模式
  const [selectedScene, setSelectedScene] = useState(null)

  const [messageApi, contextHolder] = message.useMessage()

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

    if (selectedScene && !all.find((i) => i.id === selectedScene.id)) {
      setSelectedScene(null)
    }
  }

  // 初始化
  useEffect(() => {
    fetchScene()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
      <Title title={getLang("scene_title")}></Title>
      {contextHolder}
      {activeScene ? (
        <h2 className="current-active-scene-title">
          {getLang("scene_current_active")}
          {activeScene.name}
        </h2>
      ) : (
        <h2 className="current-active-scene-title">{getLang("scene_current_active_none")}</h2>
      )}

      {/* 情景模式列表 */}
      <div className="scene-item-container">
        {sceneList.map((scene) => {
          return buildSceneItem(scene)
        })}
      </div>

      {/* 新建情景模式 */}
      <div className="scene-item scene-item-new" onClick={(e) => onNewSceneClick(e)}>
        <h3>{getLang("scene_add_new")}</h3>
        <PlusCircleOutlined className="scene-item-add-icon" />
      </div>

      {/* 详情展示 */}
      {selectedScene && selectedScene.desc && (
        <div className="scene-selected-detail">
          <span>
            <h3>{selectedScene.name}</h3>
          </span>
          <p>{selectedScene.desc}</p>
        </div>
      )}

      <div className="scene-edit-panel" style={{ display: itemEditType !== "" ? "block" : "none" }}>
        <SceneEditor
          editType={itemEditType}
          sceneInfo={itemEditInfo}
          editCallback={editCallback}></SceneEditor>
      </div>
    </SceneStyle>
  )

  function buildSceneItem(item) {
    const onActiveChange = async (e, i) => {
      let scene = null

      if (e) {
        if (activeScene) {
          activeScene.isActive = false
        }

        i.isActive = true
        await SceneOptions.setActive(i.id)
        setActiveScene(i)
        scene = i
      } else {
        i.isActive = false
        await SceneOptions.setActive("")
        setActiveScene(null)
      }

      try {
        await sendMessage("current-scene-changed", scene)
      } catch (error) {
        console.error("change current scene failed", error)
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

    const onSceneItemClick = () => {
      setSelectedScene(item)
    }

    return (
      <div
        className={classNames([
          "scene-item",
          {
            "scene-item-selected": item.id === selectedScene?.id
          }
        ])}
        key={item.id}
        onClick={onSceneItemClick}>
        <div className="scene-item-edit-container">
          <div className="scene-item-edit-icon">
            <EditFilled style={{ marginRight: 8 }} onClick={(e) => onEditClick(e, item)} />
            <Popconfirm
              title={getLang("delete")}
              description={`Delete "${item.name}" ?`}
              onConfirm={(e) => onDeleteClick(e, item)}
              onCancel={(e) => e.stopPropagation()}
              okText="Yes"
              cancelText="Cancel"
              onClick={(e) => e.stopPropagation()}>
              <DeleteFilled />
            </Popconfirm>
          </div>
        </div>

        <h3>{item.name}</h3>
        <Switch size="small" checked={item.isActive} onChange={(e) => onActiveChange(e, item)} />
      </div>
    )
  }
}

export default memo(Scene)
