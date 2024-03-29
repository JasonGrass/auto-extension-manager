import React, { forwardRef, memo, useEffect, useImperativeHandle } from "react"

import { Alert, Tag } from "antd"
import { styled } from "styled-components"

import { getLang } from ".../utils/utils"

const { CheckableTag } = Tag

// https://developer.chrome.com/docs/extensions/reference/runtime/#type-PlatformOs
export const PlatformOs = [
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

const OperationSystemTrigger = ({ options, config }, ref) => {
  useImperativeHandle(ref, () => ({
    getOsTriggerConfig: () => {
      if (selectOsKeys.length === 0) {
        throw new Error(getLang("trigger_os_select_one"))
      }

      return {
        os: selectOsKeys
      }
    }
  }))

  const [selectOsKeys, setSelectOsKeys] = React.useState([])

  // 初始化
  useEffect(() => {
    const myConfig = config.match?.triggers?.find((t) => t.trigger === "osTrigger")?.config ?? {}
    setSelectOsKeys(myConfig.os ?? [])
  }, [config])

  const handleOsSelectChange = (key, checked) => {
    const nextSelectedKeys = checked
      ? [...selectOsKeys, key]
      : selectOsKeys.filter((t) => t !== key)
    setSelectOsKeys(nextSelectedKeys)
  }

  return (
    <Style>
      <Alert message={getLang("trigger_os_select_tip")} type="info" showIcon />
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
}

export default memo(forwardRef(OperationSystemTrigger))

const Style = styled.div`
  .os-tags {
    margin: 10px 0;
  }

  .ant-tag-checkable-checked {
    background-color: #108ee9;
  }
`
