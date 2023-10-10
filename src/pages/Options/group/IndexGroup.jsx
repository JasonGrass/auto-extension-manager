import React, { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"

import { Checkbox } from "antd"
import { message } from "antd"
import classNames from "classnames"
import chromeP from "webext-polyfill-kinda"

import storage from ".../storage/sync"
import { filterExtensions, isExtExtension } from ".../utils/extensionHelper"
import analytics from ".../utils/googleAnalyze.js"
import { getLang, isStringEmpty } from ".../utils/utils.js"
import Title from "../Title.jsx"
import GroupContent from "./GroupContent.jsx"
import GroupEditor from "./GroupEditor.jsx"
import GroupNav from "./GroupNav.jsx"
import { GroupStyle } from "./IndexGroupStyle.js"
import { AddNewNavItem } from "./helpers.js"
import useGroupItems from "./hooks/useGroupItems.js"

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

  // 未分组扩展中，不显示固定分组的扩展
  const [hiddenFixedGroupInNoneGroup, setHiddenFixedGroupInNoneGroup] = useState(false)
  // 未分组扩展中，不显示隐藏分组的扩展
  const [hiddenHiddenGroupInNoneGroup, setHiddenHiddenGroupInNoneGroup] = useState(false)
  // 未分组扩展中，不显示其它分组的扩展
  const [hiddenOtherGroupInNoneGroup, setHiddenOtherGroupInNoneGroup] = useState(false)

  const [containExts, noneGroupExts, onItemClick] = useGroupItems(
    selectedGroup,
    groupListInfo,
    extensions,
    {
      hiddenFixedGroupInNoneGroup,
      hiddenHiddenGroupInNoneGroup,
      hiddenOtherGroupInNoneGroup
    }
  )

  async function updateByGroupConfigs() {
    const groupList = await storage.group.getGroups()
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

    storage.group.getGroups().then((groups) => {
      setGroupListInfo(groups)

      analytics.fireEvent("group_setting_open", {
        totalCount: groups.length
      })
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
    } else {
      messageApi.warning(`Group ${paramGroupId} not found`)
      setTimeout(() => {
        searchParams.delete("id")
        navigate(`?${searchParams.toString()}`, { replace: true })
      }, 2000)
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupListInfo, paramGroupId, messageApi])

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

  const onGroupOrdered = async (items) => {
    await storage.group.orderGroups(items)
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
      <Title title={getLang("group_title")}></Title>
      {contextHolder}
      <div className="group-edit-box">
        <div className="left-box">
          <GroupNav
            groupInfo={groupListInfo}
            current={selectedGroup}
            onSelectedChanged={onSelectedChanged}
            onGroupItemDeleted={onGroupDeleted}
            onGroupItemEdit={onGroupItemEdit}
            onGroupOrdered={onGroupOrdered}></GroupNav>
        </div>

        <div className="right-box">
          <div
            className={classNames({
              "view-hidden":
                isStringEmpty(selectedGroup?.id) || selectedGroup.id === AddNewNavItem.id
            })}>
            {selectedGroup && (
              <GroupContent
                containExts={containExts}
                noneGroupExts={noneGroupExts}
                group={selectedGroup}
                groupList={groupListInfo}
                options={options}
                onItemClick={onItemClick}>
                <div className="group-not-include-filter">
                  <Checkbox
                    checked={hiddenFixedGroupInNoneGroup}
                    onChange={(e) => setHiddenFixedGroupInNoneGroup(e.target.checked)}>
                    {getLang("group_not_include_hidden_fixed")}
                  </Checkbox>
                  <Checkbox
                    checked={hiddenHiddenGroupInNoneGroup}
                    onChange={(e) => setHiddenHiddenGroupInNoneGroup(e.target.checked)}>
                    {getLang("group_not_include_hidden_hidden")}
                  </Checkbox>
                  <Checkbox
                    checked={hiddenOtherGroupInNoneGroup}
                    onChange={(e) => setHiddenOtherGroupInNoneGroup(e.target.checked)}>
                    {getLang("group_not_include_hidden_other")}
                  </Checkbox>
                </div>
              </GroupContent>
            )}
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
