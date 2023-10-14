import React, { memo, useEffect, useState } from "react"

import { FileAddOutlined, SnippetsOutlined } from "@ant-design/icons"
import { Button, Dropdown, Input, Space } from "antd"
import { nanoid } from "nanoid"
import styled from "styled-components"

const { TextArea } = Input

const DefaultMarkdownTemplate = {
  label: "Default",
  key: "default",
  icon: <SnippetsOutlined />
}

const Index = memo(({ extensions, options, exportRange, selectIds }) => {
  const [value, setValue] = useState("")

  const [template, setTemplate] = useState(DefaultMarkdownTemplate)
  const [templateName, setTemplateName] = useState("")
  const [templateText, setTemplateText] = useState("")

  useEffect(() => {
    setValue(JSON.stringify(extensions))
  }, [extensions])

  const items = [
    DefaultMarkdownTemplate,
    {
      label: "2nd menu item",
      key: "2",
      icon: <SnippetsOutlined />,
      value: "123"
    },
    {
      label: "3rd menu item",
      key: "3",
      icon: <SnippetsOutlined />,
      value: "111111"
    },
    {
      label: "4rd menu item",
      key: "4",
      icon: <SnippetsOutlined />,
      value: "22222222222222"
    }
  ]

  const handleTemplateMenuClick = (e) => {
    const template = items.find((item) => item.key === e.key)
    setTemplate(template)
    setTemplateText(template?.value)
    setTemplateName(template?.label)
  }

  const templateMenuProps = {
    items,
    onClick: handleTemplateMenuClick
  }

  const onNewTemplateClick = () => {
    setTemplate({
      label: "",
      key: "new",
      value: ""
    })
    setTemplateText("")
    setTemplateName("")
  }

  const onCancelTemplateClick = () => {
    setTemplate(DefaultMarkdownTemplate)
    setTemplateText(DefaultMarkdownTemplate.value)
  }

  return (
    <Style>
      <div className="markdown-tools">
        {template.key !== "new" && (
          <Space>
            <Dropdown.Button menu={templateMenuProps}>{template.label}</Dropdown.Button>
          </Space>
        )}

        {template.key !== "new" && <Button onClick={onNewTemplateClick}>New</Button>}

        {template.key !== "default" && (
          <Input
            className="template-name-input"
            placeholder="template name"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}></Input>
        )}

        {template.key !== "default" && <Button>Save</Button>}

        {template.key === "new" && <Button onClick={onCancelTemplateClick}>Cancel</Button>}
      </div>

      <TextArea
        className="markdown-template-textarea"
        value={templateText}
        onChange={(e) => setTemplateText(e.target.value)}
        rows={8}></TextArea>
      <TextArea className="share-textarea" value={value} rows={12} readOnly></TextArea>
    </Style>
  )
})

export default Index

const Style = styled.div`
  .markdown-tools {
    display: flex;
    align-items: center;

    margin: 12px 0;

    & > div,
    & > button,
    & > input {
      margin-right: 12px;
    }
  }

  .template-name-input {
    width: 200px;
  }

  .markdown-template-textarea {
    overflow-x: hidden;
  }
  .share-textarea {
    margin: 12px 0;
    overflow-x: hidden;
  }
`
