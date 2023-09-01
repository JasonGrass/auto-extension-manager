import React, { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"

import { message } from "antd"
import classNames from "classnames"
import chromeP from "webext-polyfill-kinda"

import storage, { GroupOptions } from ".../storage/index"
import { filterExtensions, isExtExtension } from ".../utils/extensionHelper"
import { isStringEmpty } from ".../utils/utils.js"
import Title from "../Title.jsx"
import GroupContent from "./GroupContent.jsx"
import GroupEditor from "./GroupEditor.jsx"
import GroupNav from "./GroupNav.jsx"
import { GroupStyle } from "./IndexGroupStyle.js"
import { AddNewNavItem } from "./helpers.js"

function GroupManagement() {
  const location = useLocation()
  const navigate = useNavigate()
  const searchParams = new URLSearchParams(location.search)
  const paramGroupId = searchParams.get("id")

  const [extensions, setExtensions] = useState([])
  const [selectedGroup, setSelectedGroup] = useState()
  const [itemEditInfo, setItemEditInfo] = useState()
  const [itemEditType, setItemEditType] = useState("")

  // 不能使用其中的 groups 的数据，因为这里就是编辑 groups，随时可能会有变动
  const [options, setOptions] = useState(null)
  // 分组信息，保持快速更新
  const [groupListInfo, setGroupListInfo] = useState([])

  const [messageApi, contextHolder] = message.useMessage()

  async function updateByGroupConfigs() {
    const groupList = await GroupOptions.getGroups()
    setGroupListInfo(groupList)
  }
  // 初始化
  useEffect(() => {
    storage.options.getAll().then((o) => {
      setOptions(o)
    })

    chromeP.management.getAll().then((exts) => {
      setExtensions(filterExtensions(exts, isExtExtension))
    })

    GroupOptions.getGroups().then((groups) => {
      setGroupListInfo(groups)
    })
  }, [])

  // 如果 URL 中有 ID 参数，则切换到对应分组
  useEffect(() => {
    if (!paramGroupId) {
      return
    }
    const group = groupListInfo.find((g) => g.id === paramGroupId)
    if (group) {
      setSelectedGroup(group)
      // 切换分组之后，就删除 URL 参数中的 ID
      searchParams.delete("id")
      navigate(`?${searchParams.toString()}`, { replace: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupListInfo, paramGroupId])

  // 更新分组数据
  useEffect(() => {
    updateByGroupConfigs()
  }, [selectedGroup])

  // 如果当前分组为空，则自动选择固定分组
  useEffect(() => {
    if (paramGroupId) {
      return
    }
    if (!selectedGroup) {
      const fix = groupListInfo.find((g) => g.id === "fixed")
      setSelectedGroup(fix)
    }
  }, [selectedGroup, groupListInfo, paramGroupId])

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

  if (!options) {
    return null
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
                isStringEmpty(selectedGroup?.id) || selectedGroup.id === AddNewNavItem.id
            })}>
            <GroupContent
              group={selectedGroup}
              groupList={groupListInfo}
              extensions={extensions}
              options={options}
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
