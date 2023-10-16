import React, { forwardRef, memo, useEffect, useImperativeHandle, useRef, useState } from "react"

import { Button, Checkbox, Radio, Steps } from "antd"
import styled from "styled-components"

const ShareContent = (props, ref) => {
  const [exportRange, setExportRange] = useState(["alias", "remark"])

  useImperativeHandle(ref, () => ({
    getContent: () => {
      return exportRange
    }
  }))

  const arrayIn = (array, value) => {
    return Array.from(new Set([...array, value]))
  }

  const arrayOut = (array, value) => {
    return array.filter((t) => t !== value)
  }

  return (
    <Style>
      <Checkbox checked disabled>
        扩展基础信息
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
        别名
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
        备注
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
