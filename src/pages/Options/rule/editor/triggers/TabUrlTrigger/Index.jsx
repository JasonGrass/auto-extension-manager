import React, { forwardRef, memo, useEffect, useImperativeHandle, useState } from "react"

import { ClearOutlined, DownOutlined, PlusOutlined } from "@ant-design/icons"
import { Button, Dropdown, Input, Radio, Space, Switch } from "antd"
import { styled } from "styled-components"

/*
wildcard 通配符
regex 正则表达式
*/

/**
 * @param options 所有用户配置
 * @param config 当前规则的配置
 */
const TabUrlTrigger = memo(({ options, config }) => {
  // 域名列表
  const [matchHostList, setMatchHostList] = useState([])
  // 域名匹配计算方法，regex / wildcard
  const [matchMethod, setMatchMethod] = useState("wildcard")

  useEffect(() => {
    // 初始化匹配的 HOST 列表
    setMatchHostList(config?.matchHost ?? [""])

    // 初始化匹配的计算方式
    if (config?.matchMethod === "regex") {
      setMatchMethod("regex")
    } else {
      setMatchMethod("wildcard")
    }
  }, [config])

  const onAppendPatternClick = (e) => {
    setMatchHostList([...matchHostList, ""])
  }

  const onRemovePatternClick = (e) => {
    const list = matchHostList.filter((host) => host && host !== "" && host.trim() !== "")
    setMatchHostList(list)
  }

  const onHostInputChanged = (e, index) => {
    const list = [...matchHostList]
    list[index] = e.target.value
    setMatchHostList(list)
  }

  const onMatchMethodSwitchChanged = (e) => {
    setMatchMethod(e.target.value)
  }

  return (
    <Style>
      <div className="match-method">
        <span>
          <span>匹配方式：</span>
          <Radio.Group onChange={onMatchMethodSwitchChanged} value={matchMethod}>
            <Radio value="wildcard">通配符</Radio>
            <Radio value="regex">正则表达式</Radio>
          </Radio.Group>
        </span>
      </div>

      <div className="host-match-mode-container">
        {matchHostList.map((host, index) => (
          <Input key={index} value={host} onChange={(e) => onHostInputChanged(e, index)} />
        ))}
        <Button onClick={onAppendPatternClick}>
          <Space>
            添加 URL Pattern
            <PlusOutlined />
          </Space>
        </Button>
        <Button onClick={onRemovePatternClick}>
          <Space>
            清除空白项
            <ClearOutlined />
          </Space>
        </Button>
      </div>
    </Style>
  )
})

export default TabUrlTrigger

const Style = styled.div`
  .match-method {
    font-size: 14px;
  }

  .host-match-mode-container {
    margin: 10px 0;
    max-width: 800px;

    & > button {
      margin-right: 10px;
    }

    & > * {
      margin-bottom: 3px;
    }

    & > *:last-child {
      margin-top: 10px;
    }
  }
`
