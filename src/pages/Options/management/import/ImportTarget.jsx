import React, { memo, useEffect, useRef, useState } from "react"

import { Button, Checkbox, Input, Radio, Segmented, Steps } from "antd"
import styled from "styled-components"

const { TextArea } = Input

const ImportTarget = memo(() => {
  const [targetRange, setTargetRange] = useState("file")

  const [value, setValue] = useState("")

  return (
    <Style>
      <Segmented
        value={targetRange}
        onChange={(v) => setTargetRange(v)}
        options={[
          { label: "文本", value: "text" },
          { label: "文件", value: "file" }
        ]}
      />

      {targetRange === "text" && (
        <div className="import-text-tools">
          <Button>从剪贴板中粘贴</Button>
        </div>
      )}

      {targetRange === "file" && (
        <div className="import-file-tools">
          <Button>选择文件</Button>
        </div>
      )}

      <TextArea
        className="share-textarea"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={12}></TextArea>
    </Style>
  )
})

export default ImportTarget

const Style = styled.div`
  .share-textarea {
  }

  .import-text-tools {
    margin: 12px 0;
  }

  .import-file-tools {
    margin: 12px 0;
  }
`
