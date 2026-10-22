import React, { memo, useEffect, useState } from "react"

import { CaretDownOutlined, CaretRightOutlined } from "@ant-design/icons"
import { Space } from "antd"
import styled from "styled-components"

import { savePopupGroupFold } from "../../utils/popupGroupFolds"

/**
 * Popup 中，按分组显示时，可触发折叠功能的分组名称显示
 */
const FoldGroupName = memo(({ group, initialFolded = false, onFoldChanged }) => {
  // 是否折叠分组显示
  const [fold, setFold] = useState(initialFolded)

  useEffect(() => {
    onFoldChanged?.(fold)
  }, [fold, onFoldChanged])

  const onFoldClick = () => {
    const newValue = !fold
    setFold(newValue)
    savePopupGroupFold(group.id, newValue)
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
    color: ${(props) => props.theme.fg5};
    font-size: 10px;
  }
`
