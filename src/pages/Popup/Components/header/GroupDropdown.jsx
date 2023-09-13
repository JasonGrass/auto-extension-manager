import React, { memo, useCallback, useEffect, useState } from "react"

import { CaretDownOutlined } from "@ant-design/icons"
import { Dropdown } from "antd"
import { styled } from "styled-components"

import { formatGroups } from ".../storage/GroupOptions"
import { LocalOptions } from ".../storage/local/LocalOptions"
import { getLang } from ".../utils/utils"

const localOptions = new LocalOptions()

const GroupDropdown = memo(({ options, className, onGroupChanged }) => {
  const [selectedGroup, setSelectGroup] = useState(null)

  const raiseEnable = options.setting.isRaiseEnableWhenSwitchGroup
  const menuTitleAll = raiseEnable ? getLang("group_unselect") : getLang("group_select_all")
  const fixMenu = [
    {
      label: menuTitleAll,
      key: "all"
    }
  ]

  // 分组切换菜单
  let configGroupMenu = formatGroups(options.groups).map((g) => ({ label: g.name, key: g.id }))

  if (!(options.setting.isShowFixedExtension ?? true)) {
    configGroupMenu = configGroupMenu.filter((g) => g.key !== "fixed")
  }

  // 执行此操作，将会根据配置，切换分组显示，或者执行扩展的启用与禁用
  const raiseSelectedGroupChanged = useCallback(
    (selectedGroup) => {
      if (!selectedGroup || selectedGroup.key === "all") {
        onGroupChanged(null)
      } else {
        onGroupChanged(selectedGroup)
      }
    },
    [onGroupChanged]
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
    items: [...fixMenu, ...configGroupMenu],
    onClick: handleGroupMenuClick
  }

  if (configGroupMenu.length === 0) {
    // 没有分组数据，隐藏切换菜单
    return null
  }

  return (
    <div className={className}>
      <Dropdown menu={groupMenu} trigger={["hover"]} placement="bottom">
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

export default GroupDropdown

export const MenuStyle = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  width: 100px;
  height: 30px;

  font-size: 14px;
  text-align: center;
  background-color: #f5f5f5;
  border-radius: 4px;

  &:hover {
    background-color: #23bfc588;
  }

  .content {
    margin-bottom: -3px;
  }

  .caret {
    position: relative;
    font-size: 10px;
    left: 3px;
    top: -4px;
  }
`
