import React, { useEffect, useState } from "react"

import { Button, Form, Input } from "antd"

import { getLang, isStringEmpty } from ".../utils/utils"
import ModalEditorWrapper from "../utils/ModalEditorWrapper"

const { TextArea } = Input

function SceneEditor({ editType, sceneInfo, editCallback }) {
  const [name, setName] = useState()
  const [desc, setDesc] = useState()

  useEffect(() => {
    setName(sceneInfo?.name)
    setDesc(sceneInfo?.desc)
  }, [sceneInfo])

  const onNameChanged = (e) => {
    setName(e.target.value)
  }

  const onDescChanged = (e) => {
    setDesc(e.target.value)
  }

  const onSummitClick = (e) => {
    if (editCallback) {
      let info = sceneInfo ?? {}
      info = { ...info }
      editCallback(editType, Object.assign(info, { name, desc }))
    }
  }

  const onCancelClick = (e) => {
    editCallback?.("cancel")
  }

  if (isStringEmpty(editType)) {
    return null
  }

  return (
    <ModalEditorWrapper title={getLang("scene_edit_title")}>
      <Form labelCol={{ span: 2 }}>
        <Form.Item label={getLang("scene_edit_name")}>
          <Input maxLength={50} value={name} onChange={(e) => onNameChanged(e)} />
        </Form.Item>
        <Form.Item label={getLang("scene_edit_desc")}>
          <TextArea
            rows={2}
            showCount
            maxLength={200}
            value={desc}
            onChange={(e) => onDescChanged(e)}
          />
        </Form.Item>
        <Form.Item wrapperCol={{ offset: 2, span: 6 }}>
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

export default SceneEditor
