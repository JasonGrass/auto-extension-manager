import React, { memo, useEffect, useState } from "react"

import {
  BlockOutlined,
  CaretDownOutlined,
  DownOutlined,
  FolderOpenOutlined,
  SettingOutlined
} from "@ant-design/icons"
import { Button, Dropdown, Space, Tooltip, message } from "antd"

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

  return (
    <div className={className}>
      <Dropdown menu={groupMenu} trigger={["click"]} placement="bottomLeft">
        <Space>
          <span>{group?.name ?? "插件分组"}</span>
          <CaretDownOutlined className="caret" />
        </Space>
      </Dropdown>
    </div>
  )
})

export default GroupDropdown
