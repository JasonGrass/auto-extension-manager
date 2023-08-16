import React, { memo } from "react"

import { Alert, Tag } from "antd"
import { styled } from "styled-components"

const { CheckableTag } = Tag

// https://developer.chrome.com/docs/extensions/reference/runtime/#type-PlatformOs
const PlatformOs = [
  {
    label: "Windows",
    value: "win"
  },
  {
    label: "Mac OS",
    value: "mac"
  },
  {
    label: "Linux",
    value: "linux"
  },
  {
    label: "Android",
    value: "android"
  },
  {
    label: "Chrome OS",
    value: "cros"
  },
  {
    label: "OpenBSD OS",
    value: "openbsd"
  },
  {
    label: "Fuchsia OS",
    value: "fuchsia"
  }
]

const OperationSystemTrigger = memo(() => {
  const [selectOsKeys, setSelectOsKeys] = React.useState([])

  const handleOsSelectChange = (key, checked) => {
    const nextSelectedKeys = checked
      ? [...selectOsKeys, key]
      : selectOsKeys.filter((t) => t !== key)
    setSelectOsKeys(nextSelectedKeys)
  }

  return (
    <Style>
      <Alert message="当在选中的操作系统中首次打开浏览器时，将触发规则" type="info" showIcon />
      <div className="os-tags">
        {PlatformOs.map((os) => {
          return (
            <CheckableTag
              key={os.value}
              checked={selectOsKeys.includes(os.value)}
              onChange={(checked) => handleOsSelectChange(os.value, checked)}>
              {os.label}
            </CheckableTag>
          )
        })}
      </div>
    </Style>
  )
})

export default OperationSystemTrigger

const Style = styled.div`
  .os-tags {
    margin: 10px 0;
  }

  .ant-tag-checkable-checked {
    background-color: #108ee9;
  }
`
