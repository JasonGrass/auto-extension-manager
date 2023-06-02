import { DeleteFilled, EditFilled, PlusOutlined } from "@ant-design/icons"
import { Button, Form, Input, Popconfirm, message } from "antd"
import classNames from "classnames"
import React, { useEffect, useState } from "react"
import chromeP from "webext-polyfill-kinda"

import { GroupOptions } from ".../storage/index"
import { getIcon } from ".../utils/extensionHelper"
import { isStringEmpty } from ".../utils/utils.js"
import Title from "../Title.jsx"
import GroupEditor from "./GroupEditor.jsx"
import GroupNav from "./GroupNav.jsx"
import { GroupStyle } from "./IndexGroupStyle.js"
import { AddNewNavItem, checkSelectedGroup } from "./helpers.js"

const { TextArea } = Input

function GroupManagement() {
  const [extensions, setExtensions] = useState([])
  const [groupInfo, setGroupInfo] = useState([])
  const [selectedGroup, setSelectedGroup] = useState()
  const [itemEditInfo, setItemEditInfo] = useState()
  const [itemEditType, setItemEditType] = useState("")
  const [messageApi, contextHolder] = message.useMessage()

  async function updateByGroupConfigs() {
    const info = await GroupOptions.getGroups()
    setGroupInfo(info)
  }

  useEffect(() => {
    async function getExts() {
      const exts = await chromeP.management.getAll()
      setExtensions(exts)
    }

    async function initGroupConfigs() {
      await updateByGroupConfigs()
    }

    getExts()
    initGroupConfigs()
  }, [])

  const onSelectedChanged = (item) => {
    setSelectedGroup(item)
    if (item && item.id === AddNewNavItem.id) {
      setItemEditInfo(AddNewNavItem)
      setItemEditType("new")
    }
  }

  const onGroupDeleted = async (item) => {
    await updateByGroupConfigs()
  }

  const onGroupItemEdit = async (item) => {
    setItemEditInfo(item)
    setItemEditType("edit")
  }

  const editCallback = async (editType, info) => {
    if (editType === "cancel") {
      setItemEditInfo(null)
      setItemEditType("")
      if (info.id === AddNewNavItem.id) {
        setSelectedGroup(null)
      }
      return
    }

    try {
      if (editType === "new") {
        await updateByGroupConfigs()
        setSelectedGroup(info)
      } else if (editType === "edit") {
        await updateByGroupConfigs()
        if (selectedGroup?.id === info.id) {
          setSelectedGroup(info)
        }
      }
      setItemEditInfo(null)
      setItemEditType("")
    } catch (error) {
      messageApi.open({
        type: "error",
        content: error.message
      })
    }
  }

  return (
    <GroupStyle>
      <Title title="分组管理"></Title>
      {contextHolder}
      <div className="group-edit-box">
        <div className="left-box">
          <GroupNav
            groupInfo={groupInfo}
            current={selectedGroup}
            onSelectedChanged={onSelectedChanged}
            onGroupItemDeleted={onGroupDeleted}
            onGroupItemEdit={onGroupItemEdit}></GroupNav>
        </div>

        <div className="right-box">
          <div
            className={classNames({
              "view-hidden": !checkSelectedGroup(selectedGroup)
            })}>
            <p className="desc">{selectedGroup?.desc}</p>
            <h3>「{selectedGroup?.name}」中的插件</h3>
            {buildExtContainer(extensions, "active-items")}
            <h3>剩余未分组</h3>
            {buildExtContainer(extensions, "no-group-items")}
          </div>

          <div
            className="scene-edit-panel"
            style={{ display: itemEditType !== "" ? "block" : "none" }}>
            <GroupEditor
              editType={itemEditType}
              groupInfo={itemEditInfo}
              editCallback={editCallback}
            />
          </div>
        </div>
      </div>
    </GroupStyle>
  )

  function buildExtContainer(extItems, containerClassName) {
    const onIconClick = (e, item) => {
      console.log(item)
    }

    return (
      <ul className={classNames([containerClassName, "ext-container"])}>
        {extItems.map((item) => {
          return (
            <li
              key={item.id}
              className={classNames({
                "ext-item": true,
                "not-enable": !item.enabled
              })}>
              <img
                src={getIcon(item, 32)}
                alt=""
                onClick={(e) => onIconClick(e, item)}
              />
              <span>{item.shortName}</span>
            </li>
          )
        })}
      </ul>
    )
  }
}

export default GroupManagement
