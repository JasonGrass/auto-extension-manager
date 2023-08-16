import React, { forwardRef, memo, useEffect, useImperativeHandle, useState } from "react"

import { ClearOutlined, DownOutlined, PlusOutlined } from "@ant-design/icons"
import { Button, Dropdown, Input, Space, Switch } from "antd"

const matchMethods = [
  {
    label: "通配符",
    key: "wildcard"
  },
  {
    label: "正则表达式",
    key: "regex"
  }
]

/**
 * @param options 所有用户配置
 * @param config 当前规则的配置
 */
const TabUrlTrigger = memo(({ options, config }) => {
  // 域名列表
  const [matchHostList, setMatchHostList] = useState([])
  // 域名匹配计算方法，regex / wildcard
  const [matchMethod, setMatchMethod] = useState(matchMethods[0])

  useEffect(() => {
    // 初始化匹配的 HOST 列表
    setMatchHostList(config?.matchHost ?? [""])

    // 初始化匹配的计算方式
    if (config?.matchMethod === "regex") {
      setMatchMethod(matchMethods[1])
    } else {
      setMatchMethod(matchMethods[0])
    }
  }, [config])

  const onAppendHostClick = (e) => {
    setMatchHostList([...matchHostList, ""])
  }

  const onRemoveHostClick = (e) => {
    const list = matchHostList.filter((host) => host && host !== "" && host.trim() !== "")
    setMatchHostList(list)
  }

  const onHostInputChanged = (e, index) => {
    const list = [...matchHostList]
    list[index] = e.target.value
    setMatchHostList(list)
  }

  const onMatchMethodSwitchChanged = (e) => {
    if (e) {
      setMatchMethod(matchMethods[1])
    } else {
      setMatchMethod(matchMethods[0])
    }
  }

  return (
    <>
      <div className="match-method">
        <span className="match-method-title">是否使用正则</span>
        <Switch
          size="small"
          checked={matchMethod.key === "regex"}
          onChange={(e) => onMatchMethodSwitchChanged(e)}
        />
        <span className="match-method-label">匹配方式: {matchMethod.label}</span>
      </div>

      <div className="host-match-mode-container">
        {matchHostList.map((host, index) => (
          <Input
            key={index}
            addonBefore="http(s)://"
            value={host}
            onChange={(e) => onHostInputChanged(e, index)}
          />
        ))}
        <Button onClick={onAppendHostClick}>
          <Space>
            添加域名
            <PlusOutlined />
          </Space>
        </Button>
        <Button onClick={onRemoveHostClick}>
          <Space>
            清除空白项
            <ClearOutlined />
          </Space>
        </Button>
      </div>
    </>
  )
})

export default TabUrlTrigger
