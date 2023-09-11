import React, { memo, useEffect, useState } from "react"

import { CaretDownOutlined } from "@ant-design/icons"
import { Dropdown } from "antd"
import { styled } from "styled-components"

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

  let configGroupMenu =
    options.groups?.map((group) => ({
      label: group.name,
      key: group.id
    })) ?? []

  if (!(options.setting.isShowFixedExtension ?? true)) {
    configGroupMenu = configGroupMenu.filter((g) => g.key !== "fixed")
  }

  // 初始化
  useEffect(() => {
    localOptions.getActiveGroupId().then((groupId) => {
      setSelectGroup(options.groups?.find((g) => g.id === groupId))
    })
  }, [options])

  useEffect(() => {
    if (!selectedGroup || selectedGroup.key === "all") {
      onGroupChanged(null)
    } else {
      onGroupChanged(selectedGroup)
    }
  }, [selectedGroup, onGroupChanged])

  // 手动切换分组
  const handleGroupMenuClick = (e) => {
    const group = options.groups?.find((g) => g.id === e.key)
    setSelectGroup(group)
    localOptions.setActiveGroupId(group?.id)
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
