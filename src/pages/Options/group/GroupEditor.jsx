import React from "react"

import { storage } from ".../storage/sync"
import { getLang } from ".../utils/utils"
import ModalEditorWrapper from "../utils/ModalEditorWrapper"

function GroupEditor({ editType, groupInfo, editCallback }) {
  const onSubmit = async (values) => {
    const info = { ...values }
    if (editType === "new") {
      await storage.group.addGroup(info)
    } else {
      // Only update form fields; group membership may have changed since selection.
      info.id = groupInfo.id
      await storage.group.update(info)
    }
    await editCallback(editType, info)
  }

  return (
    <ModalEditorWrapper
      title={getLang(editType === "new" ? "group_new" : "group_edit")}
      initialValues={{ name: groupInfo?.name ?? "", desc: groupInfo?.desc ?? "" }}
      nameLabel={getLang("group_name")}
      descLabel={getLang("group_desc")}
      nameRequiredMessage={getLang("group_name_cannot_empty")}
      submitText={getLang(editType === "new" ? "add" : "save")}
      onSubmit={onSubmit}
      onCancel={() => editCallback("cancel")}
    />
  )
}

export default GroupEditor
