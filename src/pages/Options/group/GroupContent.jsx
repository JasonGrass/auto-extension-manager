import React, { memo, useEffect, useState } from "react"

import { DeleteOutlined, EditOutlined } from "@ant-design/icons"
import { Button, Input, Segmented, notification } from "antd"

import storage from ".../storage/sync"
import { isExtensionMatch } from ".../utils/searchHelper"
import { getLang } from ".../utils/utils"
import GroupContentSpace from "./GroupContentSpace"
import { GroupContentStyle } from "./GroupContentStyle"

const { Search } = Input

/**
 * 分组内容：标题，在分组中的扩展，不在分组中的扩展，描述
 */
const GroupContent = memo((props) => {
  const {
    group,
    groupList,
    options,
    onItemClick,
    containExts,
    noneGroupExts,
    sortType,
    onSortTypeChange,
    onEdit,
    onDelete
  } = props

  const [notificationApi, notificationContextHolder] = notification.useNotification()

  // 显示到界面的，在分组中的扩展（配合搜索功能）
  const [shownContainExts, setShownContainExts] = useState([])
  // 显示到界面的，没有在分组中的扩展（配合搜索功能）
  const [shownNoneGroupExts, setShownNoneGroupExts] = useState([])
  // 搜索词
  const [searchWord, setSearchWord] = useState("")

  // 搜索
  useEffect(() => {
    if (!searchWord || searchWord.trim() === "") {
      setShownContainExts(containExts)
      setShownNoneGroupExts(noneGroupExts)
      return
    }

    const shownContainExts = containExts.filter((ext) => isExtensionMatch(ext, searchWord))
    const shownNoneGroupExts = noneGroupExts.filter((ext) => isExtensionMatch(ext, searchWord))
    setShownContainExts(shownContainExts)
    setShownNoneGroupExts(shownNoneGroupExts)
  }, [searchWord, containExts, noneGroupExts])

  // 搜索
  const onSearch = (value) => {
    setSearchWord(value)
  }

  return (
    <GroupContentStyle>
      {notificationContextHolder}
      <div className="group-detail-header">
        <h2 className="group-detail-title">{group.name}</h2>
        {!storage.helper.isSpecialGroup(group) && (
          <div className="group-detail-actions">
            <Button icon={<EditOutlined />} onClick={() => onEdit(group)}>
              {getLang("edit")}
            </Button>
            <Button danger icon={<DeleteOutlined />} onClick={() => onDelete(group)}>
              {getLang("delete")}
            </Button>
          </div>
        )}
      </div>
      <div className="search-sort-bar">
        <Search
          className="search"
          placeholder="search"
          onSearch={onSearch}
          onChange={(e) => onSearch(e.target.value)}
        />
        <Segmented
          value={sortType}
          onChange={onSortTypeChange}
          options={[
            { label: getLang("group_sort_by_name"), value: "name" },
            { label: getLang("group_sort_by_install_time"), value: "installTime" }
          ]}
        />
      </div>
      <h3 className="group-name-title">{getLang("group_include", group.name)}</h3>

      <GroupContentSpace
        shownItems={shownContainExts}
        isGrouped={true}
        group={group}
        groupList={groupList}
        options={options}
        notificationApi={notificationApi}
        onItemClick={onItemClick}></GroupContentSpace>

      <h3 className="group-name-title">{getLang("group_not_include")}</h3>

      <div>{props.children}</div>

      <GroupContentSpace
        shownItems={shownNoneGroupExts}
        isGrouped={false}
        group={group}
        groupList={groupList}
        options={options}
        notificationApi={notificationApi}
        onItemClick={onItemClick}></GroupContentSpace>
      {group.desc && <p className="desc">{group.desc}</p>}
    </GroupContentStyle>
  )
})

export default GroupContent
