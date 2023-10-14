import React, { memo, useEffect, useState } from "react"
import { JsonView, allExpanded, defaultStyles } from "react-json-view-lite"
import "react-json-view-lite/dist/index.css"

import { Input } from "antd"
import styled from "styled-components"

const { TextArea } = Input
// exportRange: ["alias", "remark"]

const Index = memo(({ extensions, options, exportRange, selectIds }) => {
  const [records, setRecords] = useState([])

  const [value, setValue] = useState("")

  useEffect(() => {
    if (!options) {
      return
    }

    setRecords(
      extensions.map((r) => {
        const m = {
          id: r.id,
          name: r.name,
          description: r.description,
          homepageUrl: r.homepageUrl,
          channel: r.channel
        }
        if (r.alias) {
          m.alias = r.alias
        }
        if (r.remark) {
          m.remark = r.remark
        }
        return m
      })
    )

    // setValue(JSON.stringify(records, null, 2))
  }, [extensions, options])

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
})

export default Index

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
