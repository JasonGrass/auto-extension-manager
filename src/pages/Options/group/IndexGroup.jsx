import React, { useEffect, useState } from "react"

import { message } from "antd"
import classNames from "classnames"
import chromeP from "webext-polyfill-kinda"

import { GroupOptions } from ".../storage/index"
import { filterExtensions, isExtExtension } from ".../utils/extensionHelper"
import { isStringEmpty } from ".../utils/utils.js"
import Title from "../Title.jsx"
import GroupContent from "./GroupContent.jsx"
import GroupEditor from "./GroupEditor.jsx"
import GroupNav from "./GroupNav.jsx"
import { GroupStyle } from "./IndexGroupStyle.js"
import { AddNewNavItem } from "./helpers.js"

function GroupManagement() {
  const [extensions, setExtensions] = useState([])
  const [groupListInfo, setGroupListInfo] = useState([])
  const [selectedGroup, setSelectedGroup] = useState()
  const [itemEditInfo, setItemEditInfo] = useState()
  const [itemEditType, setItemEditType] = useState("")
  const [messageApi, contextHolder] = message.useMessage()

  async function updateByGroupConfigs() {
    const groupList = await GroupOptions.getGroups()
    setGroupListInfo(groupList)
  }

  useEffect(() => {
    async function getExts() {
      const exts = await chromeP.management.getAll()
      setExtensions(filterExtensions(exts, isExtExtension))
    }

    async function initGroupConfigs() {
      await getExts()
      await updateByGroupConfigs()
    }

    initGroupConfigs()
  }, [selectedGroup])

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
            groupInfo={groupListInfo}
            current={selectedGroup}
            onSelectedChanged={onSelectedChanged}
            onGroupItemDeleted={onGroupDeleted}
            onGroupItemEdit={onGroupItemEdit}></GroupNav>
        </div>

        <div className="right-box">
          <div
            className={classNames({
              "view-hidden":
                isStringEmpty(selectedGroup?.id) ||
                selectedGroup.id === AddNewNavItem.id
            })}>
            <GroupContent
              group={selectedGroup}
              groupList={groupListInfo}
              extensions={extensions}
            />
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
}

export default GroupManagement
