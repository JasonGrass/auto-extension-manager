import React, { useEffect, useRef, useState } from "react"

import { Alert, Form, Input, Modal } from "antd"

import { getLang } from ".../utils/utils"

function ModalEditorWrapper({
  title,
  initialValues,
  nameLabel,
  descLabel,
  nameRequiredMessage,
  submitText,
  onSubmit,
  onCancel
}) {
  const [form] = Form.useForm()
  const [trigger] = useState(() => document.activeElement)
  const nameInput = useRef(null)
  const submitting = useRef(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => () => trigger?.focus(), [trigger])

  const onFinish = async (values) => {
    if (submitting.current) return
    submitting.current = true
    setSaving(true)
    setError("")
    try {
      await onSubmit(values)
    } catch (error) {
      setError(error.message)
    } finally {
      submitting.current = false
      setSaving(false)
    }
  }

  return (
    <Modal
      open
      centered
      width={520}
      title={title}
      mask={{ closable: false }}
      keyboard={!saving}
      closable={!saving}
      confirmLoading={saving}
      cancelButtonProps={{ disabled: saving }}
      okText={submitText}
      cancelText={getLang("cancel")}
      onOk={() => form.submit()}
      onCancel={onCancel}
      afterOpenChange={(open) => open && nameInput.current?.focus()}
      styles={{ body: { paddingTop: 16 }, footer: { marginTop: 24 } }}>
      <Form
        form={form}
        layout="vertical"
        initialValues={initialValues}
        disabled={saving}
        onFinish={onFinish}>
        <Form.Item
          name="name"
          label={nameLabel}
          rules={[{ required: true, whitespace: true, message: nameRequiredMessage }]}>
          <Input ref={nameInput} maxLength={50} />
        </Form.Item>
        <Form.Item name="desc" label={descLabel} style={{ marginBottom: 0 }}>
          <Input.TextArea rows={4} showCount maxLength={200} style={{ resize: "vertical" }} />
        </Form.Item>
      </Form>
      {error && <Alert type="error" showIcon title={error} style={{ marginTop: 24 }} />}
    </Modal>
  )
}

export default ModalEditorWrapper
