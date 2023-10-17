import React, { memo, useEffect, useRef, useState } from "react"

import { Button, Checkbox, Radio, Segmented, message } from "antd"
import styled from "styled-components"

import analytics from ".../utils/googleAnalyze"
import { downloadFile, formatDate, getLang, writeToClipboard } from ".../utils/utils"
import { buildRecords } from "../utils"
import JsonFormat from "./JsonFormat/Index"
import MarkdownFormat from "./MarkdownFormat/Index"
import TextFormat from "./TextFormat/Index"

const ShareMode = memo(({ targetExtensionIds, exportRange, extensions, options }) => {
  const [messageApi, contextHolder] = message.useMessage()

  const [records, setRecords] = useState([])

  const [exportType, setExportType] = useState("text")

  const textRef = useRef()
  const jsonRef = useRef()
  const markdownRef = useRef()

  useEffect(() => {
    if (!options) {
      return
    }
    const records = buildRecords(extensions, options.management)
    setRecords(records)
  }, [extensions, options])

  const getContent = () => {
    if (exportType === "text") {
      return [textRef.current.getValue(), `EM_ShareText_${formatDate(new Date())}.txt`]
    }
    if (exportType === "json") {
      return [jsonRef.current.getValue(), `EM_${formatDate(new Date())}.json`]
    }
    if (exportType === "markdown") {
      return [markdownRef.current.getValue(), `EM_${formatDate(new Date())}.md`]
    }
  }

  const onDownload = () => {
    const [content, filename] = getContent()
    if (!content) {
      messageApi.warning("nothing can download")
      return
    }

    downloadFile(new Blob([content], { type: "application/plain" }), filename)

    analytics.fireEvent("extension_export_download", {
      action: exportType
    })
  }

  const onCopy = async () => {
    const [content] = getContent()
    if (!content) {
      messageApi.warning("nothing can copy")
      return
    }

    const copySuccess = await writeToClipboard(content)
    if (copySuccess) {
      messageApi.success("copy success")
    } else {
      messageApi.warning("copy fail")
    }

    analytics.fireEvent("extension_export_copy", {
      action: exportType
    })
  }

  return (
    <Style>
      {contextHolder}
      <Segmented
        value={exportType}
        onChange={(v) => setExportType(v)}
        options={[
          { label: getLang("management_export_share_text"), value: "text" },
          { label: "Json", value: "json" },
          { label: "Markdown", value: "markdown" }
        ]}
      />

      {exportType === "text" && (
        <TextFormat
          ref={textRef}
          targetExtensionIds={targetExtensionIds}
          exportRange={exportRange}
          extensions={records}
          options={options}></TextFormat>
      )}

      {exportType === "json" && (
        <JsonFormat
          ref={jsonRef}
          targetExtensionIds={targetExtensionIds}
          exportRange={exportRange}
          extensions={records}
          options={options}></JsonFormat>
      )}

      {exportType === "markdown" && (
        <MarkdownFormat
          ref={markdownRef}
          targetExtensionIds={targetExtensionIds}
          exportRange={exportRange}
          extensions={records}
          options={options}></MarkdownFormat>
      )}

      <div className="ext-share-btn-group">
        <Button onClick={onDownload} type="primary">
          {getLang("management_export_download")}
        </Button>
        <Button onClick={onCopy} type="primary">
          {getLang("management_export_copy_to_clipboard")}
        </Button>
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
