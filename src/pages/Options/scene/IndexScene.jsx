import React, { memo, useEffect, useState } from "react"

import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons"
import { Button, Modal, Switch, message } from "antd"
import classNames from "classnames"

import storage from ".../storage/sync"
import analytics from ".../utils/googleAnalyze.js"
import { sendMessage } from ".../utils/messageHelper.js"
import { getLang } from ".../utils/utils.js"
import Title from "../Title.jsx"
import { SortableList } from "../components/SortableList/"
import { SceneStyle } from "./IndexSceneStyle.js"
import SceneEditor from "./SceneEditor.jsx"

function Scene() {
  const [sceneList, setSceneList] = useState([])
  const [itemEditInfo, setItemEditInfo] = useState({})
  const [itemEditType, setItemEditType] = useState("")
  const [activeSceneIds, setActiveSceneIds] = useState([])
  const [modal, modalContextHolder] = Modal.useModal()
  const [messageApi, contextHolder] = message.useMessage()

  async function fetchScene() {
    const all = await storage.scene.getAll()
    const activeIds = await storage.scene.getActiveIds()
    setActiveSceneIds(activeIds)
    setSceneList(all)
    return all
  }

  useEffect(() => {
    fetchScene().then((list) => {
      analytics.fireEvent("scene_setting_open", { totalCount: list.length })
    })
  }, [])

  const editCallback = async (editType, info) => {
    if (editType !== "cancel") {
      if (editType === "new") {
        await storage.scene.addOne(info)
      } else {
        await storage.scene.update(info)
      }
      await fetchScene()
    }
    setItemEditType("")
  }

  const handleDropEnd = async (updatedList) => {
    setSceneList(updatedList)
    await storage.scene.orderScenes(updatedList)
  }

  const onActiveChange = async (checked, item) => {
    try {
      const options = await storage.options.getAll()
      const exclusive = options.setting.isActivateCurrentSceneAndDisableOthers ?? false
      const nextIds = await storage.scene.setActiveState(item.id, checked, exclusive)
      setActiveSceneIds(nextIds)
      await sendMessage("current-scenes-changed", { ids: nextIds })
    } catch (error) {
      messageApi.error(error.message)
    }
  }

  const onDeleteClick = (item) => {
    modal.confirm({
      title: getLang("delete"),
      content: getLang("scene_delete_confirm", item.name),
      centered: true,
      okText: getLang("delete"),
      cancelText: getLang("cancel"),
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          const nextIds = await storage.scene.deleteOne(item.id)
          setActiveSceneIds(nextIds ?? [])
          await fetchScene()
          await sendMessage("current-scenes-changed", { ids: nextIds ?? [] })
        } catch (error) {
          messageApi.error(error.message)
          throw error
        }
      }
    })
  }

  const activeScenes = sceneList.filter((scene) => activeSceneIds.includes(scene.id))

  return (
    <SceneStyle>
      <Title title={getLang("scene_title")} />
      {contextHolder}
      {modalContextHolder}
      <div className="scene-toolbar">
        <p className="current-active-scene-title">
          {activeScenes.length > 0
            ? getLang("scene_current_active") +
              " " +
              activeScenes.map((scene) => scene.name).join(", ")
            : getLang("scene_current_active_none")}
        </p>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setItemEditInfo({})
            setItemEditType("new")
          }}>
          {getLang("scene_add_new")}
        </Button>
      </div>

      <div className="scene-item-container">
        <SortableList
          items={sceneList}
          onChange={handleDropEnd}
          renderItem={(item) => (
            <SortableList.Item id={item.id}>
              <SortableList.DragHandle />
              <div
                className={classNames("scene-item", {
                  "scene-item-active": activeSceneIds.includes(item.id)
                })}>
                <div className="scene-item-heading">
                  <h3 className="scene-item-name" title={item.name}>
                    {item.name}
                  </h3>
                  <div className="scene-item-actions">
                    <Button
                      type="text"
                      size="small"
                      icon={<EditOutlined />}
                      aria-label={getLang("edit") + " " + item.name}
                      onClick={() => {
                        setItemEditInfo(item)
                        setItemEditType("edit")
                      }}>
                      <span className="action-label">{getLang("edit")}</span>
                    </Button>
                    <Button
                      type="text"
                      size="small"
                      danger
                      icon={<DeleteOutlined />}
                      aria-label={getLang("delete") + " " + item.name}
                      onClick={() => onDeleteClick(item)}>
                      <span className="action-label">{getLang("delete")}</span>
                    </Button>
                  </div>
                  <Switch
                    checked={activeSceneIds.includes(item.id)}
                    aria-label={getLang("popup_scene_toggle_tip", item.name)}
                    onChange={(checked) => onActiveChange(checked, item)}
                  />
                </div>
                {item.desc && <p className="scene-item-desc">{item.desc}</p>}
              </div>
            </SortableList.Item>
          )}
        />
      </div>

      {itemEditType && (
        <SceneEditor editType={itemEditType} sceneInfo={itemEditInfo} editCallback={editCallback} />
      )}
    </SceneStyle>
  )
}

export default memo(Scene)
