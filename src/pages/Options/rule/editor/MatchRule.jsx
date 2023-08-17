import React, { forwardRef, memo, useEffect, useImperativeHandle, useRef, useState } from "react"

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
    key: "urlTrigger",
    icon: <LinkOutlined />
  },
  {
    label: "情景模式",
    key: "sceneTrigger",
    icon: <ThunderboltOutlined />
  },
  {
    label: "操作系统类型",
    key: "osTrigger",
    icon: <LaptopOutlined />
  }
  // {
  //   label: "时间",
  //   key: "time",
  //   icon: <FieldTimeOutlined />
  // }
]

const MatchRule = ({ options, config }, ref) => {
  useImperativeHandle(ref, () => ({
    // 获取配置
    getMatchRuleConfig: () => {
      const matchConfig = {
        relationship: triggerRelationship,
        triggers: []
      }
      if (selectTriggerKeys.includes("urlTrigger")) {
        const urlConfig = urlTriggerRef.current.getTabUrlTriggerConfig()
        matchConfig.triggers.push({
          trigger: "urlTrigger",
          config: urlConfig
        })
      }
      if (selectTriggerKeys.includes("sceneTrigger")) {
        const sceneConfig = sceneTriggerRef.current.getSceneTriggerConfig()
        matchConfig.triggers.push({
          trigger: "sceneTrigger",
          config: sceneConfig
        })
      }
      if (selectTriggerKeys.includes("osTrigger")) {
        const osConfig = osTriggerRef.current.getOsTriggerConfig()
        matchConfig.triggers.push({
          trigger: "osTrigger",
          config: osConfig
        })
      }

      if (matchConfig.triggers.length === 0) {
        throw Error("至少添加一个匹配条件")
      }

      return matchConfig
    }
  }))

  const urlTriggerRef = useRef()
  const sceneTriggerRef = useRef()
  const osTriggerRef = useRef()

  // 选择的触发器列表
  const [selectTriggerKeys, setSelectTriggers] = useState([])
  // 多个触发器之间的组合关系（且 or 或），默认是且
  const [triggerRelationship, setTriggerRelationship] = useState("and")

  // 初始化
  useEffect(() => {
    const matchConfig = config.match ?? { triggers: [] }
    if (matchConfig.relationship === "or") {
      setTriggerRelationship(matchConfig.relationship)
    }
    let triggerKeys = []
    if (matchConfig.triggers.find((t) => t.trigger === "urlTrigger")) {
      triggerKeys = [...triggerKeys, "urlTrigger"]
    }
    if (matchConfig.triggers.find((t) => t.trigger === "sceneTrigger")) {
      triggerKeys = [...triggerKeys, "sceneTrigger"]
    }
    if (matchConfig.triggers.find((t) => t.trigger === "osTrigger")) {
      triggerKeys = [...triggerKeys, "osTrigger"]
    }
    setSelectTriggers(triggerKeys)
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

        <div
          className={
            selectTriggerKeys.includes("urlTrigger") ? "trigger-visible" : "trigger-hidden"
          }>
          <TriggerWrapper
            title="URL 匹配"
            onClose={() => {
              onTriggerRemove("host")
            }}>
            <TabUrlTrigger options={options} config={config} ref={urlTriggerRef}></TabUrlTrigger>
          </TriggerWrapper>
        </div>

        <div
          className={
            selectTriggerKeys.includes("sceneTrigger") ? "trigger-visible" : "trigger-hidden"
          }>
          <TriggerWrapper
            title="情景模式"
            onClose={() => {
              onTriggerRemove("scene")
            }}>
            <SceneTrigger options={options} config={config} ref={sceneTriggerRef}></SceneTrigger>
          </TriggerWrapper>
        </div>

        <div
          className={
            selectTriggerKeys.includes("osTrigger") ? "trigger-visible" : "trigger-hidden"
          }>
          <TriggerWrapper
            title="操作系统类型"
            onClose={() => {
              onTriggerRemove("os")
            }}>
            <OperationSystemTrigger options={options} config={config} ref={osTriggerRef} />
          </TriggerWrapper>
        </div>

        {/* 暂不支持 */}
        {/* <div className={selectTriggerKeys.includes("time") ? "trigger-visible" : "trigger-hidden"}>
          <TriggerWrapper
            title="时间"
            onClose={() => {
              onTriggerRemove("time")
            }}>
            <TimeTrigger options={options} config={config}></TimeTrigger>
          </TriggerWrapper>
        </div> */}
      </Style>
    </EditorCommonStyle>
  )
}

export default memo(forwardRef(MatchRule))
