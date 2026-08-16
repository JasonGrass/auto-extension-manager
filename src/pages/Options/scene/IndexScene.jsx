import React, { memo, useEffect, useState } from "react"

import { DeleteFilled, EditFilled, PlusCircleOutlined } from "@ant-design/icons"
import { Popconfirm, Switch, message } from "antd"
import classNames from "classnames"

import storage from ".../storage/sync"
import analytics from ".../utils/googleAnalyze.js"
import { sendMessage } from ".../utils/messageHelper.js"
import { getLang, isStringEmpty } from ".../utils/utils.js"
import Title from "../Title.jsx"
import { SortableList } from "../components/SortableList/"
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
  // 当前激活的情景模式 ID 集合
  const [activeSceneIds, setActiveSceneIds] = useState([])
  // 当前选中的情景模式
  const [selectedScene, setSelectedScene] = useState(null)

  const [messageApi, contextHolder] = message.useMessage()

  async function fetchScene() {
    const all = await storage.scene.getAll()
    const activeIds = await storage.scene.getActiveIds()
    all.forEach((item) => (item.isActive = activeIds.includes(item.id)))
    setActiveSceneIds(activeIds)
    setSceneList(all)

    if (selectedScene) {
      const one = all.find((i) => i.id === selectedScene.id)
      if (!one) {
        setSelectedScene(null)
      } else {
        setSelectedScene(one)
      }
    }

    return all
  }

  // 初始化
  useEffect(() => {
    fetchScene().then((list) => {
      analytics.fireEvent("scene_setting_open", {
        totalCount: list.length
      })
    })
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
        await storage.scene.addOne(info)
        await fetchScene()
      } else if (editType === "edit") {
        await storage.scene.update(info)
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

  const handleDropEnd = async (updatedList) => {
    setSceneList(updatedList)

    // 保存新的排序
    await storage.scene.orderScenes(updatedList)
  }

  const activeScenes = sceneList.filter((scene) => activeSceneIds.includes(scene.id))

  return (
    <SceneStyle>
      <Title title={getLang("scene_title")}></Title>
      {contextHolder}
      {activeScenes.length > 0 ? (
        <h2 className="current-active-scene-title">
          {getLang("scene_current_active")}
          {activeScenes.map((scene) => scene.name).join(", ")}
        </h2>
      ) : (
        <h2 className="current-active-scene-title">{getLang("scene_current_active_none")}</h2>
      )}

      {/* 情景模式列表 */}

      <div className="scene-item-container">
        <SortableList
          items={sceneList}
          onChange={handleDropEnd}
          renderItem={(item) => (
            <SortableList.Item id={item.id}>
              {buildSceneItem(item)}
              <SortableList.DragHandle />
            </SortableList.Item>
          )}></SortableList>
      </div>

      <div className="scene-item-handler-container">
        {/* 新建情景模式 */}
        <div className="scene-item scene-item-new" onClick={(e) => onNewSceneClick(e)}>
          <h3>{getLang("scene_add_new")}</h3>
          <PlusCircleOutlined className="scene-item-add-icon" />
        </div>
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
      try {
        const options = await storage.options.getAll()
        const exclusive = options.setting.isActivateCurrentSceneAndDisableOthers ?? false
        const nextIds = await storage.scene.setActiveState(i.id, e, exclusive)

        // Derive every switch from the canonical set so exclusive activation updates peers immediately.
        setActiveSceneIds(nextIds)
        setSceneList((current) =>
          current.map((scene) => ({ ...scene, isActive: nextIds.includes(scene.id) }))
        )
        await sendMessage("current-scenes-changed", { ids: nextIds })
      } catch (error) {
        console.error("change current active scenes failed", error)
      }
    }

    const onEditClick = (e, i) => {
      setItemEditInfo(i)
      setItemEditType("edit")
    }

    const onDeleteClick = async (e, i) => {
      const nextIds = await storage.scene.deleteOne(i.id)
      setActiveSceneIds(nextIds ?? [])
      await fetchScene()
      await sendMessage("current-scenes-changed", { ids: nextIds ?? [] })
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

        <h3 className="scene-item-name">{item.name}</h3>
        <Switch size="small" checked={item.isActive} onChange={(e) => onActiveChange(e, item)} />
      </div>
    )
  }
}

export default memo(Scene)
