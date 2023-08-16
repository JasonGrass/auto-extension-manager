import React, { memo } from "react"

import { Select } from "antd"

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
  const [selectOsKeys, setSelectOsKeys] = React.useState(["mac"])

  const handleOsSelectChange = (value) => {
    setSelectOsKeys(value)
  }

  return (
    <div>
      <Select
        mode="multiple"
        allowClear
        style={{
          width: "100%"
        }}
        placeholder="当使用选择的操作系统类型时，将触发规则"
        onChange={handleOsSelectChange}
        options={PlatformOs}
        value={selectOsKeys}
      />
    </div>
  )
})

export default OperationSystemTrigger
