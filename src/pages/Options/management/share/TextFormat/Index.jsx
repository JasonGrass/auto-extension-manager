import React, { forwardRef, memo, useEffect, useImperativeHandle, useState } from "react"

import { Input } from "antd"
import LZString from "lz-string"
import styled from "styled-components"

const { TextArea } = Input

const Index = ({ extensions, options, exportRange, targetExtensionIds }, ref) => {
  const [value, setValue] = useState("")

  useImperativeHandle(ref, () => ({
    getValue: () => {
      if (!extensions || extensions.length === 0) {
        return ""
      }
      return value
    }
  }))

  useEffect(() => {
    const result = buildShareContent(extensions, exportRange, targetExtensionIds)
    setValue(result)
  }, [extensions, exportRange, targetExtensionIds])

  return (
    <Style>
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

function buildShareContent(extensions, exportRange, targetExtensionIds) {
  const [content, length] = build(extensions, exportRange, targetExtensionIds)

  return `
I've shared ${length} browser extensions with you. Go import them in the extension manager and take a look.

--------BEGIN--------
${content}
--------END--------

Power by https://github.com/JasonGrass/auto-extension-manager
`
}

function build(extensions, exportRange, targetExtensionIds) {
  const target = extensions
    .filter((ext) => targetExtensionIds.includes(ext.id))
    .map((ext) => {
      const r = {
        id: ext.id,
        name: ext.name,
        channel: ext.channel
      }

      if (exportRange.includes("alias") && ext.alias) {
        r.alias = ext.alias
      }

      if (exportRange.includes("remark") && ext.alias) {
        r.remark = ext.remark
      }
      return r
    })

  const content = target.map((ext) => {
    let str = `##<#${ext.id}#><#${ext.name}#><#${ext.channel}#>`
    if (ext.alias) {
      str = `${str}<#${ext.alias}#>`
    }
    if (ext.remark) {
      str = `${str}<#${ext.remark}#>`
    }
    return str
  })

  return [LZString.compressToBase64(content.join("")), target.length]
}
