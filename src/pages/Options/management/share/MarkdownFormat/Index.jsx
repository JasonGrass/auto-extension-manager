import React, {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useState
} from "react"

import { Button, Dropdown, Input, Space } from "antd"
import styled from "styled-components"

import MarkdownTemplate from "./MarkdownTemplate"

const { TextArea } = Input

const Index = ({ extensions, options, exportRange, targetExtensionIds }, ref) => {
  const [value, setValue] = useState("")
  const [template, setTemplate] = useState("")

  useImperativeHandle(ref, () => ({
    getValue: () => {
      return value
    }
  }))

  useEffect(() => {
    setValue(buildMarkdown(extensions, exportRange, targetExtensionIds, template))
  }, [extensions, template, exportRange, targetExtensionIds])

  const onTemplateChange = useCallback((t) => {
    setTemplate(t)
  }, [])

  return (
    <Style>
      <MarkdownTemplate onTemplateChange={onTemplateChange}></MarkdownTemplate>
      <TextArea className="share-textarea" value={value} rows={12} readOnly></TextArea>
    </Style>
  )
}

export default memo(forwardRef(Index))

const Style = styled.div`
  .share-textarea {
    margin: 12px 0;
    overflow-x: hidden;
  }
`

function buildMarkdown(extensions, exportRange, targetExtensionIds, template) {
  const targets = extensions.filter((ext) => targetExtensionIds.includes(ext.id))

  const list = targets.map((ext) => {
    let v = template

    v = v.replaceAll("${id}", ext.id)
    v = v.replaceAll("${name}", ext.name)
    v = v.replaceAll("${description}", ext.description)
    v = v.replaceAll("${version}", ext.version)
    v = v.replaceAll("${homepageUrl}", ext.homepageUrl)
    v = v.replaceAll("${webStoreUrl}", ext.webStoreUrl)
    v = v.replaceAll("${type}", ext.type)
    v = v.replaceAll("${channel}", ext.channel)
    v = v.replaceAll("${alias}", exportRange.includes("alias") ? ext.alias ?? "" : "")
    v = v.replaceAll("${remark}", exportRange.includes("remark") ? ext.remark ?? "" : "")

    return v
  })

  return list.join("")
}
