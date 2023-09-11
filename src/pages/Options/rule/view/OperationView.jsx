import React, { memo } from "react"

import { CopyOutlined, DeleteOutlined, FormOutlined } from "@ant-design/icons"
import { Popconfirm, Switch } from "antd"
import { styled } from "styled-components"

import { getLang } from ".../utils/utils"

const OperationView = memo((props) => {
  const { record, onEdit, onDuplicate, onDelete, onEnabled } = props
  return (
    <Style>
      <div className="operation">
        <FormOutlined onClick={() => onEdit?.(record)} />
        <CopyOutlined onClick={() => onDuplicate?.(record)} />

        <Popconfirm
          title={getLang("rule_action_delete_action")}
          description="Are you sure to delete this rule?"
          onConfirm={() => onDelete?.(record)}
          okText="Yes"
          cancelText="Cancel">
          <DeleteOutlined />
        </Popconfirm>

        <Switch
          size="small"
          checked={record.enable}
          onChange={(e) => onEnabled?.(record, e)}></Switch>
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
