import React, { memo, useEffect, useState } from "react"

import { CaretDownOutlined, CaretRightOutlined } from "@ant-design/icons"
import { Space } from "antd"
import localforage from "localforage"
import styled from "styled-components"

const groupExpandForage = localforage.createInstance({
  driver: localforage.LOCALSTORAGE,
  name: "LocalOptions",
  version: 1.0,
  storeName: "popupGroupExpand"
})

/**
 * Popup 中，按分组显示时，可触发折叠功能的分组名称显示
 */
const FoldGroupName = memo(({ group, onFoldChanged }) => {
  // 是否折叠分组显示
  const [fold, setFold] = useState(false)

  useEffect(() => {
    groupExpandForage.getItem(group.id).then((value) => {
      setFold(value ? true : false)
    })
  }, [group])

  useEffect(() => {
    onFoldChanged?.(fold)
  }, [fold, onFoldChanged])

  const onFoldClick = () => {
    const newValue = !fold
    setFold(newValue)
    if (newValue) {
      groupExpandForage.setItem(group.id, newValue)
    } else {
      groupExpandForage.removeItem(group.id)
    }
  }

  return (
    <Style>
      <span className="fold-text" onClick={onFoldClick}>
        <Space className="fold-icon">{fold ? <CaretRightOutlined /> : <CaretDownOutlined />}</Space>{" "}
        {group.name}
      </span>
    </Style>
  )
})

export default FoldGroupName

const Style = styled.span`
  .fold-text {
    display: flex;
    align-items: center;
  }

  .fold-icon {
    margin-right: 4px;
    color: #888;
    font-size: 10px;
  }
`
