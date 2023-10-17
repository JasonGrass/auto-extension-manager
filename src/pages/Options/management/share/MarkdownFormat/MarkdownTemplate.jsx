import React, { memo, useEffect, useState } from "react"

import { FileAddOutlined, SnippetsOutlined } from "@ant-design/icons"
import { Button, Dropdown, Input, Space } from "antd"
import localforage from "localforage"
import { nanoid } from "nanoid"
import styled from "styled-components"

import { getLang } from ".../utils/utils"

const forage = localforage.createInstance({
  driver: localforage.LOCALSTORAGE,
  name: "LocalCache",
  version: 1.0,
  storeName: "markdown_template"
})

const { TextArea } = Input

const DefaultTemplateText = `
## \${name}
name: \${name}
id: \${id}
version: \${version}
description: \${description}
homepage: \${homepageUrl}
url: \${webStoreUrl}
type: \${type}
channel: \${channel}
alias: \${alias}
remark: \${remark}
`

/*
{
    "key": "kbfnbcaeplbcioakkpcpgfkobkghlhen",
    "description": "Improve your writing with all-in-one communication assistance—including grammar check, generative AI, and more.",
    "homepageUrl": "https://chrome.google.com/webstore/detail/kbfnbcaeplbcioakkpcpgfkobkghlhen",
    "id": "kbfnbcaeplbcioakkpcpgfkobkghlhen",
    "installType": "normal",
    "isApp": false,
    "name": "Grammarly: Grammar Checker and AI Writing App",
    "offlineEnabled": false,
    "shortName": "Grammarly: Grammar Checker and AI Writing App",
    "type": "extension",
    "updateUrl": "https://clients2.google.com/service/update2/crx",
    "version": "14.1131.0",
    "channel": "Chrome",
    "webStoreUrl": "https://chrome.google.com/webstore/detail/kbfnbcaeplbcioakkpcpgfkobkghlhen",
}
*/

const DefaultMarkdownTemplate = {
  label: getLang("management_export_md_template_default"),
  key: "default",
  value: DefaultTemplateText,
  icon: <SnippetsOutlined />
}

const MarkdownTemplate = memo(({ onTemplateChange }) => {
  const [currentTemplate, setCurrentTemplate] = useState(DefaultMarkdownTemplate)
  const [templateKey, setTemplateKey] = useState("")
  const [templateName, setTemplateName] = useState("")
  const [templateText, setTemplateText] = useState(DefaultTemplateText)

  const [templateItems, setTemplateItems] = useState([DefaultMarkdownTemplate])

  const [isOnSaving, setIsOnSaving] = useState(false)

  useEffect(() => {
    setTemplateKey(currentTemplate?.key ?? "")
    setTemplateText(currentTemplate?.value)
    setTemplateName(currentTemplate?.label)
  }, [currentTemplate])

  // onTemplateChange
  useEffect(() => {
    onTemplateChange?.(templateText)
  }, [templateText, onTemplateChange])

  const init = async () => {
    const items = []
    const templateKeys = await forage.keys()
    for (const key of templateKeys) {
      const template = await forage.getItem(key)
      items.push({
        key: key,
        label: template.name,
        value: template.value,
        icon: <SnippetsOutlined />
      })
    }
    const allItems = [DefaultMarkdownTemplate, ...items]
    setTemplateItems(allItems)
    if (currentTemplate) {
      const one = allItems.find((i) => i.key === templateKey)
      if (one) {
        setCurrentTemplate(one)
      } else {
        setCurrentTemplate(DefaultMarkdownTemplate)
      }
    } else {
      setCurrentTemplate(DefaultMarkdownTemplate)
    }

    return allItems
  }

  // init
  useEffect(() => {
    init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 切换选择的模板
  const handleTemplateMenuClick = (e) => {
    const template = templateItems.find((item) => item.key === e.key)
    setCurrentTemplate(template)
  }

  const templateMenuProps = {
    items: templateItems,
    onClick: handleTemplateMenuClick
  }

  // 新建
  const onNewTemplateClick = () => {
    setCurrentTemplate({
      label: "",
      key: "new",
      value: "[${name}](${webStoreUrl} )\n"
    })
    setTemplateText("")
    setTemplateName("")
  }

  // 取消编辑
  const onCancelTemplateClick = () => {
    setIsOnSaving(false)
    setCurrentTemplate(DefaultMarkdownTemplate)
    setTemplateText(DefaultMarkdownTemplate.value)
  }

  // 删除模板
  const onDeleteTemplateClick = async () => {
    if (!currentTemplate) {
      return
    }
    if (currentTemplate.key === "default" || currentTemplate.key === "new") {
      return
    }

    await forage.removeItem(currentTemplate.key)
    await init()
  }

  // 保存
  const onSaveTemplateClick = async () => {
    setIsOnSaving(true)
    if (!templateName || !templateText) {
      return
    }

    if (currentTemplate.key === "default") {
      return
    }

    const temp = {
      key: currentTemplate.key === "new" ? nanoid() : currentTemplate.key,
      name: templateName,
      value: templateText
    }

    forage.setItem(temp.key, temp)

    const allItems = await init()
    setIsOnSaving(false)

    if (currentTemplate.key === "new") {
      // 切换到新建在模板上面来
      setTimeout(() => {
        const newOne = allItems.find((t) => t.key === temp.key)
        if (newOne) {
          setCurrentTemplate(newOne)
        }
      })
    }
  }

  return (
    <Style>
      <div className="markdown-tools">
        {templateKey !== "new" && (
          <Space>
            <Dropdown.Button menu={templateMenuProps}>{currentTemplate?.label}</Dropdown.Button>
          </Space>
        )}
        {templateKey !== "new" && (
          <Button onClick={onNewTemplateClick}>
            {getLang("management_export_md_template_new")}
          </Button>
        )}
        {templateKey !== "default" && (
          <Input
            className="template-name-input"
            placeholder="template name"
            value={templateName}
            status={isOnSaving && !templateName ? "error" : ""}
            onChange={(e) => setTemplateName(e.target.value)}></Input>
        )}
        {templateKey !== "default" && (
          <Button onClick={onSaveTemplateClick}>{getLang("save")}</Button>
        )}
        {templateKey === "new" && (
          <Button onClick={onCancelTemplateClick}>{getLang("cancel")}</Button>
        )}
        {templateKey !== "new" && templateKey !== "default" && (
          <Button onClick={onDeleteTemplateClick}>{getLang("delete")}</Button>
        )}
      </div>

      <TextArea
        className="markdown-template-textarea"
        value={templateText}
        status={isOnSaving && !templateText ? "error" : ""}
        onChange={(e) => setTemplateText(e.target.value)}
        rows={12}></TextArea>
    </Style>
  )
})

export default MarkdownTemplate

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
`
