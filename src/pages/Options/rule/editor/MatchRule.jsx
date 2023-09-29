import React, { forwardRef, memo, useEffect, useImperativeHandle, useRef, useState } from "react"

import {
  ClockCircleOutlined,
  LaptopOutlined,
  LinkOutlined,
  PlusCircleOutlined,
  ThunderboltOutlined
} from "@ant-design/icons"
import { Button, Dropdown, Radio, Space, message } from "antd"
import lodash from "lodash"

import { getLang } from ".../utils/utils"
import { ruleEmitBuilder } from "../emitter.js"
import EditorCommonStyle from "./CommonStyle"
import Style from "./MatchRuleStyle"
import OperationSystemTrigger from "./triggers/OsTrigger/Index"
import SceneTrigger from "./triggers/SceneTrigger/Index"
import TabUrlTrigger from "./triggers/TabUrlTrigger/Index"
import TimeTrigger from "./triggers/TimeTrigger/Index"
import TriggerWrapper from "./triggers/TriggerWrapper/Index"

const triggerModes = [
  {
    label: getLang("rule_trigger_url_name"),
    key: "urlTrigger",
    icon: <LinkOutlined />
  },
  {
    label: getLang("rule_trigger_scene_name"),
    key: "sceneTrigger",
    icon: <ThunderboltOutlined />
  },
  {
    label: getLang("rule_trigger_os_name"),
    key: "osTrigger",
    icon: <LaptopOutlined />
  },
  {
    label: getLang("rule_trigger_period_name"),
    key: "periodTrigger",
    icon: <ClockCircleOutlined />
  }
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
      if (selectTriggerKeys.includes("periodTrigger")) {
        const periodConfig = periodTriggerRef.current.getPeriodTriggerConfig()
        matchConfig.triggers.push({
          trigger: "periodTrigger",
          config: periodConfig
        })
      }

      if (matchConfig.triggers.length === 0) {
        throw Error(getLang("rule_set_match_at_least_one"))
      }

      return matchConfig
    },
    getSelectTriggerKeys: () => {
      return selectTriggerKeys
    }
  }))

  const [messageApi, messageContextHolder] = message.useMessage()
  const urlTriggerRef = useRef()
  const sceneTriggerRef = useRef()
  const osTriggerRef = useRef()
  const periodTriggerRef = useRef()

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
    if (matchConfig.triggers.find((t) => t.trigger === "periodTrigger")) {
      triggerKeys = [...triggerKeys, "periodTrigger"]
    }
    setSelectTriggers(triggerKeys)
  }, [config])

  // 通知选择的 trigger 类型变更
  useEffect(() => {
    const emitter = ruleEmitBuilder()
    emitter.emit("triggers-change", selectTriggerKeys)
  }, [selectTriggerKeys])

  // 添加触发条件的菜单
  const triggerModeMenuProps = {
    items: triggerModes,
    onClick: (e) => {
      const trigger = triggerModes.find((m) => m.key === e.key)
      if (!trigger) {
        return
      }
      if (selectTriggerKeys.find((k) => k === e.key)) {
        messageApi.warning(getLang("rule_set_match_cannot_duplicate", trigger.label))
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
        {messageContextHolder}
        <div className="editor-step-header">
          <span className="title">1 {getLang("rule_set_match_title")}</span>
        </div>

        <div className="trigger-operation-settings">
          <Dropdown menu={triggerModeMenuProps}>
            <Button>
              <Space>
                {getLang("rule_set_match_add")}
                <PlusCircleOutlined />
              </Space>
            </Button>
          </Dropdown>

          <span
            className={selectTriggerKeys.length > 1 ? "trigger-relationship" : "trigger-hidden"}>
            <Radio.Group onChange={onTriggerRelationshipChange} value={triggerRelationship}>
              <Radio value="and">{getLang("rule_set_match_all")}</Radio>
              <Radio value="or">{getLang("rule_set_match_any")}</Radio>
            </Radio.Group>
          </span>
        </div>

        <div
          className={
            selectTriggerKeys.includes("urlTrigger") ? "trigger-visible" : "trigger-hidden"
          }>
          <TriggerWrapper
            title={getLang("rule_trigger_url_name")}
            onClose={() => {
              onTriggerRemove("urlTrigger")
            }}>
            <TabUrlTrigger options={options} config={config} ref={urlTriggerRef}></TabUrlTrigger>
          </TriggerWrapper>
        </div>

        <div
          className={
            selectTriggerKeys.includes("sceneTrigger") ? "trigger-visible" : "trigger-hidden"
          }>
          <TriggerWrapper
            title={getLang("rule_trigger_scene_name")}
            onClose={() => {
              onTriggerRemove("sceneTrigger")
            }}>
            <SceneTrigger options={options} config={config} ref={sceneTriggerRef}></SceneTrigger>
          </TriggerWrapper>
        </div>

        <div
          className={
            selectTriggerKeys.includes("osTrigger") ? "trigger-visible" : "trigger-hidden"
          }>
          <TriggerWrapper
            title={getLang("rule_trigger_os_name")}
            onClose={() => {
              onTriggerRemove("osTrigger")
            }}>
            <OperationSystemTrigger options={options} config={config} ref={osTriggerRef} />
          </TriggerWrapper>
        </div>

        <div
          className={
            selectTriggerKeys.includes("periodTrigger") ? "trigger-visible" : "trigger-hidden"
          }>
          <TriggerWrapper
            title={getLang("rule_trigger_period_name")}
            onClose={() => {
              onTriggerRemove("periodTrigger")
            }}>
            <TimeTrigger options={options} config={config} ref={periodTriggerRef}></TimeTrigger>
          </TriggerWrapper>
        </div>
      </Style>
    </EditorCommonStyle>
  )
}

export default memo(forwardRef(MatchRule))
