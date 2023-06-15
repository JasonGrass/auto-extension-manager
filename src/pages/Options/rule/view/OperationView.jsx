import React, { memo } from "react"

import { CopyOutlined, DeleteOutlined, FormOutlined } from "@ant-design/icons"
import { Switch } from "antd"
import { styled } from "styled-components"

const OperationView = memo(({ id, record }) => {
  return (
    <Style>
      <div className="operation">
        <FormOutlined />
        <CopyOutlined />
        <DeleteOutlined />
        <Switch></Switch>
      </div>
    </Style>
  )
})

export default OperationView

const Style = styled.div`
  font-size: 24px;

  .operation {
    display: flex;
    align-items: center;

    & > * {
      margin-right: 10px;
    }
  }
`
