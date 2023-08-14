import React, { memo, useState } from "react"

import { CaretDownOutlined } from "@ant-design/icons"
import { Dropdown } from "antd"
import { styled } from "styled-components"

const GroupDropdown = memo(({ options, className, onGroupChanged }) => {
  const [group, setGroup] = useState(null)

  const fixMenu = [
    {
      label: "默认",
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

  const handleGroupMenuClick = (e) => {
    const group = options.groups?.filter((g) => g.id === e.key)[0]
    setGroup(group)

    if (!group || group.key === "all") {
      onGroupChanged(null)
    } else {
      onGroupChanged(group)
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
            <span className="menu-item-text">{group?.name ?? "默认"}</span>
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
