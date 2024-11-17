import React, { memo, useEffect, useRef, useState } from "react"

import {
  CloseOutlined,
  CopyOutlined,
  MenuOutlined,
  MoreOutlined,
  RedoOutlined
} from "@ant-design/icons"
import Icon from "@ant-design/icons/lib/components/Icon"
import { Dropdown, Space } from "antd"
import _ from "lodash"

const MoreOperationDropdown = memo(({ options, className }) => {
  // 定义快照名称
  const snapshots = [
    { key: "snapshot1", label: "快照 1" },
    { key: "snapshot2", label: "快照 2" },
    { key: "snapshot3", label: "快照 3" }
  ]

  // MenuProps["items"]
  const moreOperationMenuItems = [
    {
      key: "1",
      label: "禁用全部扩展",
      icon: <CloseOutlined />
    },
    {
      key: "2",
      label: "保存扩展快照",
      icon: <CopyOutlined />,
    },
    {
      key: "3",
      label: <span>恢复快照</span>,
      icon: <RedoOutlined />,
      children: snapshots
    }
  ]

  return (
    <div className={className}>
      <Space className="setting-icon">
        <Dropdown
          menu={{ items: moreOperationMenuItems }}
          placement="bottomLeft"
          trigger={["click"]}>
          <MenuOutlined />
        </Dropdown>
      </Space>
    </div>
  )
})

export default MoreOperationDropdown
