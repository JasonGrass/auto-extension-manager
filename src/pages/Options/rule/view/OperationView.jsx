import React, { memo } from "react"

import { CopyOutlined, DeleteOutlined, FormOutlined } from "@ant-design/icons"
import { Popconfirm, Switch } from "antd"
import { styled } from "styled-components"

const OperationView = memo((props) => {
  const { record, onEdit, onDuplicate, onDelete } = props
  return (
    <Style>
      <div className="operation">
        <FormOutlined onClick={() => onEdit?.(record)} />
        <CopyOutlined onClick={() => onDuplicate?.(record)} />

        <Popconfirm
          title="删除规则"
          description="Are you sure to delete this rule?"
          onConfirm={() => onDelete?.(record)}
          okText="Yes"
          cancelText="Cancel">
          <DeleteOutlined />
        </Popconfirm>

        <Switch size="small"></Switch>
      </div>
    </Style>
  )
})

export default OperationView

const Style = styled.div`
  font-size: 20px;

  .operation {
    display: flex;
    align-items: center;

    & > * {
      margin-right: 10px;
    }
  }
`
