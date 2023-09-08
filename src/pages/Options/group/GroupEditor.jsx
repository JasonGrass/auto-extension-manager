import React, { useEffect, useState } from "react"

import { Button, Form, Input, message } from "antd"

import { GroupOptions } from ".../storage/index"
import { getLang, isStringEmpty } from ".../utils/utils"
import ModalEditorWrapper from "../utils/ModalEditorWrapper"
import { AddNewNavItem } from "./helpers"

const { TextArea } = Input

function GroupEditor({ editType, groupInfo, editCallback }) {
  const [name, setGroupName] = useState("")
  const [desc, setGroupDesc] = useState("")

  let title = ""
  if (editType === "new") {
    title = getLang("group_new")
  } else if (editType === "edit") {
    title = getLang("group_edit")
  }

  useEffect(() => {
    if (editType === "edit") {
      setGroupName(groupInfo.name)
      setGroupDesc(groupInfo.desc)
    } else {
      setGroupName("")
      setGroupDesc("")
    }
  }, [editType, groupInfo])

  const onNameChanged = (e) => {
    console.log(e)
    setGroupName(e.target.value)
  }
  const onDescChanged = (e) => {
    setGroupDesc(e.target.value)
  }

  const onSummitClick = async (e) => {
    if (isStringEmpty(name)) {
      message.warning(getLang("group_name_cannot_empty"))
      return
    }

    try {
      if (editType === "new") {
        const group = {
          name,
          desc
        }
        await GroupOptions.addGroup(group)
        setGroupName("")
        setGroupDesc("")
        editCallback?.(editType, group)
      } else if (editType === "edit") {
        let info = groupInfo ?? {}
        info = { ...info }
        Object.assign(info, { name, desc })
        await GroupOptions.update(info)
        editCallback?.(editType, info)
      }
    } catch (error) {
      message.error(error.message)
    }
  }

  const onCancelClick = (e) => {
    if (editType === "new") {
      editCallback?.("cancel", AddNewNavItem)
    } else {
      editCallback?.("cancel", groupInfo)
    }
  }

  return (
    <ModalEditorWrapper title={title}>
      <Form labelCol={{ span: 4 }}>
        <Form.Item label={getLang("group_name")}>
          <Input maxLength={50} value={name} onChange={(e) => onNameChanged(e)} />
        </Form.Item>
        <Form.Item label={getLang("group_desc")}>
          <TextArea
            rows={3}
            showCount
            maxLength={200}
            value={desc}
            onChange={(e) => onDescChanged(e)}
          />
        </Form.Item>
        <Form.Item wrapperCol={{ offset: 4, span: 4 }}>
          <div style={{ display: "flex" }}>
            <Button type="primary" onClick={(e) => onSummitClick(e)}>
              {editType === "new" ? getLang("add") : getLang("update")}
            </Button>
            <Button style={{ marginLeft: 10 }} onClick={(e) => onCancelClick(e)}>
              {getLang("cancel")}
            </Button>
          </div>
        </Form.Item>
      </Form>
    </ModalEditorWrapper>
  )
}

export default GroupEditor
