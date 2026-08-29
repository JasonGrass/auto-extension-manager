import React, { useEffect, useMemo, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"

import { RestOutlined, RobotOutlined, SaveOutlined } from "@ant-design/icons"
import { Button, Checkbox, Popconfirm, Space } from "antd"
import { message } from "antd"
import classNames from "classnames"
import chromeP from "webext-polyfill-kinda"

import { attachCachedExtensionIcons } from ".../pages/Background/extension/ExtensionRepo"
import { LocalOptions } from ".../storage/local"
import storage from ".../storage/sync"
import { filterExtensions, isExtExtension } from ".../utils/extensionHelper"
import analytics from ".../utils/googleAnalyze.js"
import { getLang, isStringEmpty } from ".../utils/utils.js"
import AiGroupSuggestModal from "./AiGroupSuggestModal.jsx"
import GroupContent from "./GroupContent.jsx"
import GroupEditor from "./GroupEditor.jsx"
import GroupNav from "./GroupNav.jsx"
import GroupSnapshotModal from "./GroupSnapshotModal.jsx"
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

  // 排序方式：name 按名称排序，installTime 按安装时间排序
  const [sortType, setSortType] = useState("name")

  // AI 分组建议弹窗
  const [aiModalOpen, setAiModalOpen] = useState(false)

  // 分组快照弹窗
  const [snapshotOpen, setSnapshotOpen] = useState(false)

  const localOptions = new LocalOptions()

  // 分类统计：属于任意分组（含固定/隐藏组）即为已分类，与「未分组」区域的口径一致
  const { totalCount, groupedCount, ungroupedCount } = useMemo(() => {
    const groupedIds = new Set()
    for (const group of groupListInfo) {
      for (const id of group.extensions ?? []) {
        groupedIds.add(id)
      }
    }
    const grouped = extensions.filter((ext) => groupedIds.has(ext.id)).length
    return {
      totalCount: extensions.length,
      groupedCount: grouped,
      ungroupedCount: extensions.length - grouped
    }
  }, [extensions, groupListInfo])

  const [containExts, noneGroupExts, onItemClick] = useGroupItems(
    selectedGroup,
    groupListInfo,
    extensions,
    {
      hiddenFixedGroupInNoneGroup,
      hiddenHiddenGroupInNoneGroup,
      hiddenOtherGroupInNoneGroup
    },
    sortType
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

    chromeP.management.getAll().then(async (exts) => {
      const list = await attachCachedExtensionIcons(filterExtensions(exts, isExtExtension))
      setExtensions(list)
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

  // 分组配置被整体改变（清空 / 快照恢复）后的统一收尾：
  // 刷新列表、重置选中项、清掉 popup 记住的"当前分组"
  const resetGroupViewAfterConfigChange = async () => {
    await updateByGroupConfigs()
    setSelectedGroup(null)
    await localOptions.setActiveGroupId("")
  }

  const onGroupsCleared = resetGroupViewAfterConfigChange
  const onSnapshotRestored = resetGroupViewAfterConfigChange

  // 一键清空所有普通分组（固定/隐藏分组保留），扩展本身不受影响
  const onClearAllGroups = async () => {
    try {
      const removed = await storage.group.clearAll()
      messageApi.success(getLang("group_clear_all_done", removed))
      await resetGroupViewAfterConfigChange()
    } catch (error) {
      messageApi.error(String(error?.message ?? error))
    }
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
      {/* 标题行：左侧标题，右上角分组操作（与设置/历史页的按钮风格统一） */}
      <div className="group-header">
        <h1>{getLang("group_title")}</h1>
        <Space>
          <Button icon={<RobotOutlined />} onClick={() => setAiModalOpen(true)}>
            {getLang("ai_group_button")}
          </Button>
          <Popconfirm
            title={getLang("group_clear_all_confirm_title")}
            description={getLang("group_clear_all_confirm_content")}
            onConfirm={onClearAllGroups}
            okText="Yes"
            cancelText="No">
            <Button danger icon={<RestOutlined />}>
              {getLang("group_clear_all")}
            </Button>
          </Popconfirm>
          <Button icon={<SaveOutlined />} onClick={() => setSnapshotOpen(true)}>
            {getLang("group_snapshot_button")}
          </Button>
        </Space>
      </div>
      {contextHolder}

      {/* 分类统计：总插件数 / 已分类 / 未分类，随分组编辑实时刷新 */}
      <div className="group-stat-bar">
        <span>{getLang("group_stat_total", totalCount)}</span>
        <span>{getLang("group_stat_grouped", groupedCount)}</span>
        <span>{getLang("group_stat_ungrouped", ungroupedCount)}</span>
      </div>

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
                onItemClick={onItemClick}
                sortType={sortType}
                onSortTypeChange={setSortType}>
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

      <AiGroupSuggestModal
        open={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        onApplied={updateByGroupConfigs}
        extensions={extensions}
        groupListInfo={groupListInfo}
      />

      <GroupSnapshotModal
        open={snapshotOpen}
        onClose={() => setSnapshotOpen(false)}
        onRestored={onSnapshotRestored}
      />
    </GroupStyle>
  )
}

export default GroupManagement
