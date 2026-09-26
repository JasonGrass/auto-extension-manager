import React from "react"

import { getLang } from ".../utils/utils"
import ModalEditorWrapper from "../utils/ModalEditorWrapper"

function SceneEditor({ editType, sceneInfo, editCallback }) {
  return (
    <ModalEditorWrapper
      title={getLang(editType === "new" ? "scene_add_new" : "scene_edit_title")}
      initialValues={{ name: sceneInfo?.name ?? "", desc: sceneInfo?.desc ?? "" }}
      nameLabel={getLang("scene_edit_name")}
      descLabel={getLang("scene_edit_desc")}
      nameRequiredMessage={getLang("scene_name_cannot_empty")}
      submitText={getLang(editType === "new" ? "add" : "save")}
      onSubmit={(values) => editCallback(editType, { ...sceneInfo, ...values })}
      onCancel={() => editCallback("cancel")}
    />
  )
}

export default SceneEditor
