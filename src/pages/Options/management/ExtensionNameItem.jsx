import React, { memo, useEffect, useState } from "react"

import { Tooltip } from "antd"
import classNames from "classnames"
import styled from "styled-components"

import ExtensionChannelLabel from "./ExtensionChannelLabel"

/**
 * 扩展管理设置中的列表 Item 项
 */
const ExtensionNameItem = memo(({ name, record }) => {
  const [itemEnable, setItemEnable] = useState(record.enabled)

  useEffect(() => {
    setItemEnable(record.enabled)
  }, [record])

  return (
    <Tooltip placement="topLeft" title={name}>
      <Style>
        <img src={record.icon} alt="" width={16} height={16} />
        <span
          className={classNames([
            "column-name-title",
            {
              "column-name-title-disable": !itemEnable
            }
          ])}>
          {name}
        </span>
        <ExtensionChannelLabel channel={record.channel}></ExtensionChannelLabel>
      </Style>
    </Tooltip>
  )
})

export default ExtensionNameItem

const Style = styled.span`
  display: flex;
  align-items: center;

  img {
    margin-right: 5px;
  }

  .column-name-title {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .column-name-title-disable {
    color: #c1c1c1;
  }
`
