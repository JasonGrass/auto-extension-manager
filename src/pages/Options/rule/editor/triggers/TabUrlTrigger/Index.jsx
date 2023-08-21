import React, { forwardRef, memo, useEffect, useImperativeHandle, useState } from "react"

import { ClearOutlined, DownOutlined, PlusOutlined } from "@ant-design/icons"
import { Alert, Button, Dropdown, Input, Radio, Space, Switch } from "antd"
import { styled } from "styled-components"

/*
wildcard 通配符
regex 正则表达式
*/

/**
 * @param options 所有用户配置
 * @param config 当前规则的配置
 */
const TabUrlTrigger = ({ options, config }, ref) => {
  useImperativeHandle(ref, () => ({
    getTabUrlTriggerConfig: () => {
      const urls = matchHostList
        .filter((host) => host && host.trim() !== "")
        .map((host) => host.trim())

      if (urls.length === 0) {
        throw Error("[匹配条件] 没有添加任何 URL")
      }

      return {
        matchMethod: matchMethod,
        matchUrl: urls
      }
    }
  }))

  // 域名列表
  const [matchHostList, setMatchHostList] = useState([])
  // 域名匹配计算方法，regex / wildcard
  const [matchMethod, setMatchMethod] = useState("wildcard")

  // 初始化
  useEffect(() => {
    const myConfig = config.match?.triggers?.find((t) => t.trigger === "urlTrigger")?.config ?? {}

    // 初始化匹配的 HOST 列表
    setMatchHostList(myConfig.matchUrl ?? [""])

    // 初始化匹配的计算方式
    if (myConfig.matchMethod === "regex") {
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
      <Alert
        message="URL 默认是指当前打开的那个标签中的 URL，具体匹配规则见详细说明"
        type="info"
        showIcon
        action={
          <a href="https://ext.jgrass.cc/docs/rule" target="_blank" rel="noreferrer">
            详细说明
          </a>
        }
      />

      <div className="match-method">
        <span>
          <span>匹配方式：</span>
          <Radio.Group onChange={onMatchMethodSwitchChanged} value={matchMethod}>
            <Radio value="wildcard">通配符</Radio>
            <Radio value="regex">正则表达式</Radio>
          </Radio.Group>
        </span>
      </div>

      <div className="url-pattern-container">
        {matchHostList.map((host, index) => (
          <Input
            key={index}
            value={host}
            onChange={(e) => onHostInputChanged(e, index)}
            placeholder="e.g. *baidu.com* ; file://*.pdf ;"
          />
        ))}
      </div>

      <div className="url-pattern-buttons">
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
}

export default memo(forwardRef(TabUrlTrigger))

const Style = styled.div`
  .match-method {
    margin-top: 5px;
    font-size: 14px;
  }

  .url-pattern-container {
    margin: 5px 0;

    & > * {
      margin-bottom: 3px;
    }
  }

  .url-pattern-buttons {
    & > button {
      margin-right: 10px;
    }
  }
`
