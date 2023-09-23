import React, { memo, useCallback, useEffect, useState } from "react"

import { CaretDownOutlined } from "@ant-design/icons"
import { Dropdown } from "antd"

import { LocalOptions } from ".../storage/local/LocalOptions"
import { getLang } from ".../utils/utils"
import { MenuStyle } from "./MenuStyle"

const localOptions = new LocalOptions()

const SingleGroupDropdown = memo((props) => {
  const { options, groups, onGroupChanged } = props
  const [selectedGroup, setSelectGroup] = useState(null)

  // 辅助菜单
  const raiseEnable = options.setting.isRaiseEnableWhenSwitchGroup
  const menuTitleAll = raiseEnable ? getLang("group_unselect") : getLang("group_select_all")
  const fixMenu = [
    {
      label: menuTitleAll,
      key: "all"
    }
  ]

  // 分组切换菜单（单选）
  let groupMenuItems = groups
    .map((g) => ({ label: g.name, key: g.id }))
    .filter((g) => g.key !== "hidden") // Popup 中不展示隐藏分组

  // 判断是否展示固定分组
  if (!(options.setting.isShowFixedExtension ?? true)) {
    groupMenuItems = groupMenuItems.filter((g) => g.key !== "fixed")
  }

  // 执行此操作，将会根据配置，切换分组显示，或者执行扩展的启用与禁用
  const raiseSelectedGroupChanged = useCallback(
    (selectedGroup) => {
      if (!selectedGroup || selectedGroup.key === "all") {
        onGroupChanged({
          select: null,
          action: raiseEnable
        })
      } else {
        onGroupChanged({
          select: selectedGroup,
          action: raiseEnable
        })
      }
    },
    [raiseEnable, onGroupChanged]
  )

  // 初始化
  useEffect(() => {
    localOptions.getActiveGroupId().then((groupId) => {
      setSelectGroup(options.groups?.find((g) => g.id === groupId))
    })
  }, [options])

  // 切换分组没有启用禁用逻辑时的业务
  useEffect(() => {
    const isRaiseEnableWhenSwitchGroup = options.setting?.isRaiseEnableWhenSwitchGroup ?? false
    if (!isRaiseEnableWhenSwitchGroup) {
      raiseSelectedGroupChanged(selectedGroup)
    }
  }, [selectedGroup, options, raiseSelectedGroupChanged])

  // 手动切换分组
  const handleGroupMenuClick = (e) => {
    const group = options.groups?.find((g) => g.id === e.key)
    setSelectGroup(group)
    localOptions.setActiveGroupId(group?.id)

    // 切换分组有启用禁用逻辑时的业务
    const isRaiseEnableWhenSwitchGroup = options.setting?.isRaiseEnableWhenSwitchGroup ?? false
    // 只有手动切换分组，才执行分组启用与禁用逻辑
    if (isRaiseEnableWhenSwitchGroup) {
      raiseSelectedGroupChanged(group)
    }
  }

  const groupMenu = {
    items: [...fixMenu, ...groupMenuItems],
    onClick: handleGroupMenuClick
  }

  if (groupMenuItems.length === 0) {
    // 没有分组数据，隐藏切换菜单
    return null
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
