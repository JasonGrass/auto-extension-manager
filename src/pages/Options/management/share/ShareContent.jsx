import React, { forwardRef, memo, useEffect, useImperativeHandle, useRef, useState } from "react"

import { Button, Checkbox, Radio, Steps } from "antd"
import styled from "styled-components"

import { getLang } from ".../utils/utils"

const ShareContent = ({ config }, ref) => {
  const [exportRange, setExportRange] = useState(["alias", "remark"])

  useImperativeHandle(ref, () => ({
    getContent: () => {
      return exportRange
    }
  }))

  useEffect(() => {
    if (!config) {
      return
    }
    setExportRange(config.exportRange)
  }, [config])

  const arrayIn = (array, value) => {
    return Array.from(new Set([...array, value]))
  }

  const arrayOut = (array, value) => {
    return array.filter((t) => t !== value)
  }

  return (
    <Style>
      <Checkbox checked disabled>
        {getLang("management_export_extension_base_info")}
      </Checkbox>
      <Checkbox
        checked={exportRange.includes("alias")}
        onChange={(e) => {
          if (e.target.checked) {
            setExportRange(arrayIn(exportRange, "alias"))
          } else {
            setExportRange(arrayOut(exportRange, "alias"))
          }
        }}>
        {getLang("column_alias")}
      </Checkbox>
      <Checkbox
        checked={exportRange.includes("remark")}
        onChange={(e) => {
          if (e.target.checked) {
            setExportRange(arrayIn(exportRange, "remark"))
          } else {
            setExportRange(arrayOut(exportRange, "remark"))
          }
        }}>
        {getLang("column_remark")}
      </Checkbox>
    </Style>
  )
}

export default memo(forwardRef(ShareContent))

const Style = styled.div`
  display: flex;
  flex-direction: column;

  & > label {
    margin-bottom: 12px;
  }
`
