import React, { forwardRef, memo, useEffect, useImperativeHandle, useState } from "react"

import { Input } from "antd"
import styled from "styled-components"

import { getLang } from ".../utils/utils"
import { buildShareText } from "./buildShareText"

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
  const [content, length] = buildShareText(extensions, exportRange, targetExtensionIds)

  const title = getLang("management_export_share_text_title", length)

  return `
${title}

--------BEGIN--------
${content}
--------END--------

Power by https://github.com/JasonGrass/auto-extension-manager
`
}
