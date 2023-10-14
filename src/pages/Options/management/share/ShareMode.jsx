import React, { memo, useEffect, useRef, useState } from "react"

import { Button, Checkbox, Radio, Segmented } from "antd"
import styled from "styled-components"

import { buildRecords } from "../utils"
import JsonFormat from "./JsonFormat/Index"
import MarkdownFormat from "./MarkdownFormat/Index"
import TextFormat from "./TextFormat/Index"

const ShareMode = memo(({ extensions, options }) => {
  const [records, setRecords] = useState([])

  const [exportType, setExportType] = useState("markdown")

  useEffect(() => {
    if (!options) {
      return
    }
    const records = buildRecords(extensions, options.management)
    setRecords(records)
  }, [extensions, options])

  return (
    <Style>
      <Segmented
        value={exportType}
        onChange={(v) => setExportType(v)}
        options={[
          { label: "分享文本", value: "text" },
          { label: "Json", value: "json" },
          { label: "Markdown", value: "markdown" }
        ]}
      />

      {exportType === "text" && <TextFormat extensions={records} options={options}></TextFormat>}

      {exportType === "json" && <JsonFormat extensions={records} options={options}></JsonFormat>}

      {exportType === "markdown" && (
        <MarkdownFormat extensions={records} options={options}></MarkdownFormat>
      )}

      <div className="ext-share-btn-group">
        <Button>下载</Button>
        <Button>复制到剪贴板</Button>
      </div>
    </Style>
  )
})

export default ShareMode

const Style = styled.div`
  .ext-share-btn-group {
    & > button {
      margin-right: 12px;
    }
  }
`
