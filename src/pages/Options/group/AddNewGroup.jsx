import { DeleteFilled, EditFilled, PlusOutlined } from "@ant-design/icons"
import { Button, Form, Input, message } from "antd"
import classNames from "classnames"
import React, { useEffect, useState } from "react"

import { GroupOptions } from ".../storage/index"
import { isStringEmpty } from ".../utils/utils"

const { TextArea } = Input

function AddNewGroup({ onNewGroupAdded }) {
  const [name, setGroupName] = useState("")
  const [desc, setGroupDesc] = useState("")

  const onNameChanged = (e) => {
    console.log(e)
    setGroupName(e.target.value)
  }
  const onDescChanged = (e) => {
    setGroupDesc(e.target.value)
  }

  const onSummitClick = async (e) => {
    if (isStringEmpty(name)) {
      message.warning("分组名称不能为空")
      return
    }

    const group = {
      name,
      desc
    }
    await GroupOptions.addGroup(group)
    setGroupName("")
    setGroupDesc("")

    if (onNewGroupAdded) {
      onNewGroupAdded(group)
    }
  }

  return (
    <Form labelCol={{ span: 4 }}>
      <Form.Item label="分组名称">
        <Input maxLength={50} value={name} onChange={(e) => onNameChanged(e)} />
      </Form.Item>
      <Form.Item label="分组描述">
        <TextArea
          rows={3}
          showCount
          maxLength={200}
          value={desc}
          onChange={(e) => onDescChanged(e)}
        />
      </Form.Item>
      <Form.Item wrapperCol={{ offset: 4, span: 4 }}>
        <Button type="primary" onClick={(e) => onSummitClick(e)}>
          添加分组
        </Button>
      </Form.Item>
    </Form>
  )
}

export default AddNewGroup
