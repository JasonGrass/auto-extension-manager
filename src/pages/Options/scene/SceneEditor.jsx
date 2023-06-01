import { DeleteFilled, EditFilled, PlusOutlined } from "@ant-design/icons"
import { Button, Form, Input, message } from "antd"
import classNames from "classnames"
import React, { useEffect, useState } from "react"

import optionsStorage, { GroupOptions } from ".../storage/options-storage"
import { isStringEmpty } from ".../utils/utils"
import { SceneEditorStyle } from "./SceneEditorStyle"

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
    if (editCallback) {
      editCallback("cancel")
    }
  }

  if (isStringEmpty(editType)) {
    return null
  }

  return (
    <SceneEditorStyle>
      <div className="scene-editor-container">
        <h3>编辑情景模式</h3>
        <hr />
        <Form labelCol={{ span: 2 }}>
          <Form.Item label="名称">
            <Input
              maxLength={50}
              value={name}
              onChange={(e) => onNameChanged(e)}
            />
          </Form.Item>
          <Form.Item label="描述">
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
                {editType === "new" ? "添加" : "更新"}
              </Button>

              <Button
                style={{ marginLeft: 10 }}
                onClick={(e) => onCancelClick(e)}>
                取消
              </Button>
            </div>
          </Form.Item>
        </Form>
      </div>
    </SceneEditorStyle>
  )
}

export default SceneEditor
