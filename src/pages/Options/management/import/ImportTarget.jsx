import React, { forwardRef, memo, useEffect, useImperativeHandle, useRef, useState } from "react"

import { Button, Checkbox, Input, Radio, Segmented, Steps } from "antd"
import styled from "styled-components"

import { readFromClipboard } from ".../utils/utils"

const { TextArea } = Input

const ImportTarget = ({ config }, ref) => {
  const [value, setValue] = useState("")

  useImperativeHandle(ref, () => ({
    getValue: () => {
      return value
    }
  }))

  useEffect(() => {
    if (config) {
      setValue(config.value)
    }
  }, [config])

  const onPasteFromClipboard = async () => {
    const content = await readFromClipboard()
    if (content) {
      setValue(content)
    }
  }

  const onReadFromFile = async () => {
    try {
      const files = await window.showOpenFilePicker({
        types: [
          {
            description: "json/text",
            accept: {
              "application/json": [".json"],
              "text/plain": [".txt"]
            }
          }
        ],
        multiple: false
      })
      const fileHandle = files[0]
      if (!fileHandle) {
        return
      }
      const file = await fileHandle.getFile()
      const fileContent = await file.text()
      setValue(fileContent)
    } catch (error) {
      console.warn(error)
    }
  }

  return (
    <Style>
      <div className="import-text-tools">
        <Button onClick={onPasteFromClipboard}>从剪贴板中粘贴</Button>
        <Button onClick={onReadFromFile}>从文件读取</Button>
      </div>

      <TextArea
        className="share-textarea"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={12}></TextArea>
    </Style>
  )
}

export default memo(forwardRef(ImportTarget))

const Style = styled.div`
  .share-textarea {
  }

  .import-text-tools {
    display: flex;
    margin: 0 0 12px 0;
    & > button {
      margin-right: 12px;
    }
  }
`
