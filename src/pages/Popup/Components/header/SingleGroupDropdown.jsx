import React, { memo, useEffect, useMemo, useRef, useState } from "react"

import { CaretDownOutlined } from "@ant-design/icons"
import { Dropdown } from "antd"
import { styled } from "styled-components"

import { LocalOptions } from ".../storage/local/LocalOptions"
import { getLang } from ".../utils/utils"
import { getGroupEnableState } from "../../ExtensionOnOffHandler"
import GroupStateToggle from "./GroupStateToggle"
import { MenuStyle } from "./MenuStyle"

const localOptions = new LocalOptions()

const SingleGroupDropdown = memo((props) => {
  const { options, extensions, enabledById, groups, onGroupChanged, onGroupEnableChanged } = props
  const [selectedGroup, setSelectGroup] = useState(null)
  const [groupStateSnapshot, setGroupStateSnapshot] = useState(null)
  const batchPendingRef = useRef(false)

  const menuTitleAll = getLang("group_select_all")
  const fixMenu = [
    {
      label: menuTitleAll,
      key: "all",
      className: "group-dropdown-menu-item"
    }
  ]

  // 分组切换菜单（单选）
  const visibleGroups = useMemo(() => {
    let result = groups

    if (!(options.setting.isShowHiddenExtension ?? false)) {
      result = result.filter((g) => g.id !== "hidden")
    }

    return result
  }, [groups, options.setting.isShowHiddenExtension])

  const fixedExtensionIds = useMemo(
    () => groups.find((group) => group.id === "fixed")?.extensions ?? [],
    [groups]
  )

  const handleGroupEnableChanged = async (group, enabled) => {
    if (batchPendingRef.current) {
      return
    }

    batchPendingRef.current = true
    // 批量操作期间冻结所有开关的视觉状态，避免逐个扩展更新时短暂显示 mixed。
    setGroupStateSnapshot(
      Object.fromEntries(
        visibleGroups.map((item) => [
          item.id,
          getGroupEnableState(item, extensions, fixedExtensionIds, enabledById)
        ])
      )
    )
    try {
      await onGroupEnableChanged(group, enabled)
    } finally {
      batchPendingRef.current = false
      setGroupStateSnapshot(null)
    }
  }

  const groupMenuItems = visibleGroups.map((group) => {
    const isFixed = group.id === "fixed"
    const state =
      groupStateSnapshot?.[group.id] ??
      getGroupEnableState(group, extensions, fixedExtensionIds, enabledById)

    return {
      label: (
        <GroupMenuItem>
          <span className="group-name">{group.name}</span>
          {!isFixed && (
            <GroupStateToggle
              state={state}
              loading={groupStateSnapshot !== null}
              groupName={group.name}
              onChange={(enabled) => handleGroupEnableChanged(group, enabled)}
            />
          )}
        </GroupMenuItem>
      ),
      key: group.id,
      title: group.name,
      className: "group-dropdown-menu-item"
    }
  })

  // 初始化
  useEffect(() => {
    localOptions.getActiveGroupId().then((groupId) => {
      const group = visibleGroups.find((g) => g.id === groupId) ?? null
      setSelectGroup(group)
      onGroupChanged(group)

      // 缓存的分组可能已被删除或已按显示设置隐藏，避免下次仍进入不可恢复的筛选状态。
      if (groupId && !group) {
        localOptions.setActiveGroupId(null)
      }
    })
  }, [visibleGroups, onGroupChanged])

  // 手动切换分组
  const handleGroupMenuClick = (e) => {
    const group = visibleGroups.find((g) => g.id === e.key) ?? null
    setSelectGroup(group)
    localOptions.setActiveGroupId(group?.id)
    onGroupChanged(group)
  }

  const groupMenu = {
    items: [...fixMenu, ...groupMenuItems],
    onClick: handleGroupMenuClick,
    style: { maxHeight: "none", overflowY: "visible" }
  }

  return (
    <div>
      <Dropdown menu={groupMenu} trigger={["hover"]} placement="bottomLeft">
        <MenuStyle>
          <span className="content">
            <span className="menu-item-text">{selectedGroup?.name ?? menuTitleAll}</span>
            <CaretDownOutlined className="caret" />
          </span>
        </MenuStyle>
      </Dropdown>
    </div>
  )
})

export default SingleGroupDropdown

const GroupMenuItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  width: 210px;

  .group-name {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`
