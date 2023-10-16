import React, { forwardRef, memo, useEffect, useImperativeHandle, useState } from "react"
import { JsonView, allExpanded, defaultStyles } from "react-json-view-lite"
import "react-json-view-lite/dist/index.css"

import { Input } from "antd"
import styled from "styled-components"

const { TextArea } = Input
// exportRange: ["alias", "remark"]

const Index = ({ extensions, options, exportRange, targetExtensionIds }, ref) => {
  const [records, setRecords] = useState([])

  useImperativeHandle(ref, () => ({
    getValue: () => {
      if (records.length === 0) {
        return ""
      }
      return JSON.stringify(records, null, 2)
    }
  }))

  useEffect(() => {
    if (!extensions || extensions.length === 0) {
      return
    }

    setRecords(
      extensions
        .filter((ext) => targetExtensionIds.includes(ext.id))
        .map((ext) => {
          const result = {
            id: ext.id,
            name: ext.name,
            description: ext.description,
            version: ext.version,
            homepageUrl: ext.homepageUrl,
            channel: ext.channel,
            type: ext.type
          }
          if (ext.webStoreUrl) {
            result.webStoreUrl = ext.webStoreUrl
          }
          if (ext.alias && exportRange.includes("alias")) {
            result.alias = ext.alias
          }
          if (ext.remark && exportRange.includes("remark")) {
            result.remark = ext.remark
          }
          return result
        })
    )
  }, [extensions, exportRange, targetExtensionIds])

  if (!options) {
    return null
  }

  return (
    <Style>
      <JsonView
        style={{
          ...defaultStyles,
          container: "json-view-container",
          undefinedValue: "json-view-undefined"
        }}
        data={records}
        shouldExpandNode={allExpanded}
      />
    </Style>
  )
}

export default memo(forwardRef(Index))

const Style = styled.div`
  .json-view-container {
    height: 320px;

    margin: 12px 0;
    padding: 8px 0;
    border: 1px solid #eee;
    border-radius: 4px;

    font-family: "Courier New", Courier, monospace;

    & > div {
      height: 100%;
      overflow-y: scroll;
    }
  }
`
