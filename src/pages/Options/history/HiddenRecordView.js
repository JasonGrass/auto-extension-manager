import React, { memo, useEffect, useState } from "react"

import { CloseCircleOutlined } from "@ant-design/icons"
import { Dropdown, Space } from "antd"
import { styled } from "styled-components"

const HiddenRecordView = memo(({ records, hiddenExtensionIds, recover }) => {
  const [items, setItems] = useState([])

  useEffect(() => {
    const hiddenRecords = records.filter((item) => hiddenExtensionIds.includes(item.extensionId))
    const map = new Map(hiddenRecords.map((obj) => [obj.extensionId, obj]))
    setItems(Array.from(map.values()))
  }, [records, hiddenExtensionIds])

  const menuItemOnClick = (e, item) => {
    e.stopPropagation()
    recover?.(e, item)
    setItems((prev) => prev.filter((i) => i.extensionId !== item.extensionId))
  }

  const multiMenu = () => {
    const buildLabel = (item) => {
      return (
        <ItemStyle onClick={(e) => menuItemOnClick(e, item)}>
          <img src={item.icon} alt="icon" width={24} />
          <div className="hidden-record-name">{item.name}</div>
          <Space className="hidden-record-close" onClick={(e) => menuItemOnClick(e, item)}>
            <CloseCircleOutlined />
          </Space>
        </ItemStyle>
      )
    }

    const menuItems = items.map((item) => {
      return {
        label: buildLabel(item),
        key: item.id,
        title: item.name
      }
    })

    return {
      items: menuItems,
      multiple: true,
      selectable: true
    }
  }

  if (items.length === 0) {
    return null
  }

  return (
    <div>
      <Dropdown.Button menu={multiMenu()} trigger={["hover"]} placement="bottomLeft">
        隐藏的记录
      </Dropdown.Button>
    </div>
  )
})

export default HiddenRecordView

const ItemStyle = styled.div`
  display: flex;
  align-items: center;

  img {
    margin-right: 8px;
  }

  .hidden-record-name {
    flex: 1 0 auto;
    max-width: 200px;

    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .hidden-record-close {
    margin-left: 8px;
    color: #f5222d;
  }
`
