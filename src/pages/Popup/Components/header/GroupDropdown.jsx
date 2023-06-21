import React, { memo, useState } from "react"

import { CaretDownOutlined } from "@ant-design/icons"
import { Dropdown, Space } from "antd"

const GroupDropdown = memo(({ options, className, onGroupChanged }) => {
  const [group, setGroup] = useState(null)

  const fixMenu = [
    {
      label: "全部",
      key: "all"
    }
  ]

  const configGroupMenu =
    options.groups?.map((group) => ({
      label: group.name,
      key: group.id
    })) ?? []

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
      <Dropdown menu={groupMenu} trigger={["click"]} placement="bottomLeft">
        <Space>
          <span className="menu-item-text">{group?.name ?? "插件分组"}</span>
          <CaretDownOutlined className="caret" />
        </Space>
      </Dropdown>
    </div>
  )
})

export default GroupDropdown
