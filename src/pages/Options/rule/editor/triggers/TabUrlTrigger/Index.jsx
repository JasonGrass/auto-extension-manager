import React, { forwardRef, memo, useEffect, useImperativeHandle, useState } from "react"

import {
  ClearOutlined,
  DownOutlined,
  PlusOutlined,
  QuestionCircleOutlined
} from "@ant-design/icons"
import { Alert, Button, Checkbox, Dropdown, Input, Radio, Space, Switch, Tooltip } from "antd"
import { nanoid } from "nanoid"
import { styled } from "styled-components"

import { SortableList } from ".../pages/Options/components/SortableList"
import { getLang } from ".../utils/utils"

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
      const urls = matchHostList.filter((host) => !host.isEmpty()).map((host) => host.url.trim())

      if (urls.length === 0) {
        throw Error(getLang("trigger_url_no_any"))
      }

      return {
        matchMethod: matchMethod,
        matchUrl: urls,
        useFullUrl: useFullUrl
      }
    }
  }))

  // 域名列表
  const [matchHostList, setMatchHostList] = useState([])
  // 域名匹配计算方法，regex / wildcard
  const [matchMethod, setMatchMethod] = useState("wildcard")
  // 是否使用完整 URL 进行计算
  const [useFullUrl, setUseFullUrl] = useState(false)

  // 初始化
  useEffect(() => {
    const myConfig = config.match?.triggers?.find((t) => t.trigger === "urlTrigger")?.config ?? {}

    // 初始化匹配的 HOST 列表
    setMatchHostList(urlStrList2ObjectArray(myConfig.matchUrl))

    // 初始化匹配的计算方式
    if (myConfig.matchMethod === "regex") {
      setMatchMethod("regex")
    } else {
      setMatchMethod("wildcard")
    }

    setUseFullUrl(myConfig.useFullUrl === true)
  }, [config])

  const onAppendPatternClick = (e) => {
    const list = [...matchHostList]
    list.push(createUrlObject(""))
    setMatchHostList(list)
  }

  const onRemovePatternClick = (e) => {
    const list = matchHostList.filter((host) => !host.isEmpty())
    setMatchHostList(list)
  }

  const onHostInputChanged = (e, item) => {
    item.url = e.target.value
    setMatchHostList([...matchHostList])
  }

  const onMatchMethodSwitchChanged = (e) => {
    setMatchMethod(e.target.value)
  }

  const onFullUrlSettingChange = (e) => {
    setUseFullUrl(e.target.checked)
  }

  /**
   * URL 排序回调
   */
  const handleUrlDropEnd = async (updatedList) => {
    setMatchHostList(updatedList)
  }

  return (
    <Style>
      <Alert
        message={getLang("trigger_url_match_desc")}
        type="info"
        showIcon
        action={
          <a href="https://ext.jgrass.cc/docs/rule" target="_blank" rel="noreferrer">
            {getLang("trigger_url_match_detail_title")}
          </a>
        }
      />

      <div className="match-method">
        <span>
          <span>{getLang("trigger_url_match_method_title")} </span>
          <Radio.Group onChange={onMatchMethodSwitchChanged} value={matchMethod}>
            <Radio value="wildcard">{getLang("trigger_url_wildcard")}</Radio>
            <Radio value="regex">{getLang("trigger_url_regex")}</Radio>
          </Radio.Group>
        </span>
        <span style={{ marginLeft: 80 }}>
          <Checkbox checked={useFullUrl} onChange={onFullUrlSettingChange}>
            <span>
              {getLang("trigger_url_use_full")}{" "}
              <Tooltip placement="top" title={getLang("trigger_url_use_full_desc")}>
                <QuestionCircleOutlined />
              </Tooltip>{" "}
            </span>
          </Checkbox>
        </span>
      </div>

      <div className="url-pattern-container">
        <SortableList
          items={matchHostList}
          onChange={handleUrlDropEnd}
          renderItem={(item, index) => (
            <SortableList.Item id={item.id}>
              <Input
                key={item.id}
                value={item.url}
                onChange={(e) => onHostInputChanged(e, item)}
                placeholder="e.g. *feishu.cn* ; file://*.pdf ;"
              />
              <SortableList.DragHandle />
            </SortableList.Item>
          )}></SortableList>
      </div>

      <div className="url-pattern-buttons">
        <Button onClick={onAppendPatternClick}>
          <Space>
            {getLang("trigger_url_add_pattern")}
            <PlusOutlined />
          </Space>
        </Button>
        <Button onClick={onRemovePatternClick}>
          <Space>
            {getLang("trigger_url_clear_empty")}
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

    ul.SortableList {
      display: block;
    }

    li.SortableItem {
      box-shadow: none;
      padding: 2px 2px 2px 0;
    }
  }

  .url-pattern-buttons {
    & > button {
      margin-right: 10px;
    }
  }
`

function urlStrList2ObjectArray(urlList) {
  if (!urlList || urlList.length === 0) {
    return []
  }

  return urlList.map((url) => {
    return createUrlObject(url)
  })
}

/**
 * 创建 URL 链接的包装对象
 */
function createUrlObject(url) {
  const obj = Object.create(urlObjectProtoType)
  obj.url = url ?? ""
  obj.id = nanoid()
  return obj
}

const urlObjectProtoType = {
  isEmpty() {
    return !Boolean(this.url) || !Boolean(this.url.trim())
  }
}
