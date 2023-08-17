import React, { forwardRef, memo, useEffect, useImperativeHandle, useState } from "react"

import {
  ClearOutlined,
  DownOutlined,
  FieldTimeOutlined,
  LaptopOutlined,
  LinkOutlined,
  PlusCircleOutlined,
  PlusOutlined,
  ThunderboltOutlined
} from "@ant-design/icons"
import { Button, Dropdown, Input, Radio, Space, Switch, message } from "antd"
import classNames from "classnames"
import lodash from "lodash"

import EditorCommonStyle from "./CommonStyle"
import Style from "./MatchRuleStyle"
import OperationSystemTrigger from "./triggers/OsTrigger/Index"
import SceneTrigger from "./triggers/SceneTrigger/Index"
import TabUrlTrigger from "./triggers/TabUrlTrigger/Index"
import TimeTrigger from "./triggers/TimeTrigger/Index"
import TriggerWrapper from "./triggers/TriggerWrapper/Index"

const triggerModes = [
  {
    label: "URL 链接",
    key: "host",
    icon: <LinkOutlined />
  },
  {
    label: "情景模式",
    key: "scene",
    icon: <ThunderboltOutlined />
  },
  {
    label: "操作系统类型",
    key: "os",
    icon: <LaptopOutlined />
  },
  {
    label: "时间",
    key: "time",
    icon: <FieldTimeOutlined />
  }
]

/*
sceneList
[
  {
    id: "1",
    name: "工作模式",
    desc: "描述",
    isActive: true
  }
]

config
{
    "matchMode": "host/scene",
    "matchScene": "scene id",
    "matchHost": [
      "*baidu.com*"
    ],
    "matchMethod": "regex/wildcard"
}

*/

const MatchRule = ({ options, sceneList, config }, ref) => {
  // useImperativeHandle(ref, () => ({
  //   // 获取配置
  //   getMatchRuleConfig: () => {
  //     const hosts = matchHostList
  //       .filter((host) => host && host.trim() !== "")
  //       .map((host) => host.trim())

  //     if (matchMode.key === "host" && hosts.length === 0) {
  //       throw Error("没有添加任何域名规则")
  //     }
  //     if (matchMode.key === "scene" && !matchScene?.id) {
  //       throw Error("没有选择任何情景模式")
  //     }

  //     return {
  //       matchMode: matchMode.key,
  //       matchMethod: matchMethod.key,
  //       matchScene: matchScene?.id,
  //       matchHost: hosts
  //     }
  //   }
  // }))

  // 选择的触发器列表
  const [selectTriggerKeys, setSelectTriggers] = useState(["host"]) // 默认添加上 URL 匹配
  // 多个触发器之间的组合关系（且 or 或），默认是且
  const [triggerRelationship, setTriggerRelationship] = useState("and")

  useEffect(() => {
    // 初始化 selectTriggers
    // TODO
  }, [config])

  // 添加触发条件的菜单
  const triggerModeMenuProps = {
    items: triggerModes,
    onClick: (e) => {
      const trigger = triggerModes.find((m) => m.key === e.key)
      if (!trigger) {
        return
      }
      if (selectTriggerKeys.find((k) => k === e.key)) {
        message.warning(`不能重复添加条件：${trigger.label}`)
        return
      }
      setSelectTriggers([...selectTriggerKeys, trigger.key])
    }
  }

  // 移除触发条件
  const onTriggerRemove = (triggerKey) => {
    const copy = [...selectTriggerKeys]
    lodash.remove(copy, (k) => k === triggerKey)
    setSelectTriggers(copy)
  }

  // 触发条件之间的组合关系
  const onTriggerRelationshipChange = (e) => {
    setTriggerRelationship(e.target.value)
  }

  return (
    <EditorCommonStyle>
      <Style>
        <div className="header">
          <span className="title">1 匹配条件</span>
        </div>

        <div className="trigger-operation-settings">
          <Dropdown menu={triggerModeMenuProps}>
            <Button>
              <Space>
                添加匹配条件
                <PlusCircleOutlined />
              </Space>
            </Button>
          </Dropdown>

          <span
            className={selectTriggerKeys.length > 1 ? "trigger-relationship" : "trigger-hidden"}>
            <Radio.Group onChange={onTriggerRelationshipChange} value={triggerRelationship}>
              <Radio value="and">满足以下所有条件</Radio>
              <Radio value="or">满足以下任一条件</Radio>
            </Radio.Group>
          </span>
        </div>

        <div className={selectTriggerKeys.includes("host") ? "trigger-visible" : "trigger-hidden"}>
          <TriggerWrapper
            title="URL 匹配"
            onClose={() => {
              onTriggerRemove("host")
            }}>
            <TabUrlTrigger options={options} config={config}></TabUrlTrigger>
          </TriggerWrapper>
        </div>

        <div className={selectTriggerKeys.includes("scene") ? "trigger-visible" : "trigger-hidden"}>
          <TriggerWrapper
            title="情景模式"
            onClose={() => {
              onTriggerRemove("scene")
            }}>
            <SceneTrigger options={options} config={config}></SceneTrigger>
          </TriggerWrapper>
        </div>

        <div className={selectTriggerKeys.includes("os") ? "trigger-visible" : "trigger-hidden"}>
          <TriggerWrapper
            title="操作系统类型"
            onClose={() => {
              onTriggerRemove("os")
            }}>
            <OperationSystemTrigger options={options} config={config}></OperationSystemTrigger>
          </TriggerWrapper>
        </div>

        <div className={selectTriggerKeys.includes("time") ? "trigger-visible" : "trigger-hidden"}>
          <TriggerWrapper
            title="时间"
            onClose={() => {
              onTriggerRemove("time")
            }}>
            <TimeTrigger options={options} config={config}></TimeTrigger>
          </TriggerWrapper>
        </div>
      </Style>
    </EditorCommonStyle>
  )
}

export default memo(forwardRef(MatchRule))
