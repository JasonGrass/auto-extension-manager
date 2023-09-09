import React, { forwardRef, memo, useEffect, useImperativeHandle, useState } from "react"

import { Alert, Button, Checkbox, Dropdown, Radio, Space, Steps, Switch } from "antd"
import classNames from "classnames"
import { styled } from "styled-components"

import { getLang } from ".../utils/utils"
import { ruleEmitBuilder } from "../../emitter.js"

const CustomRuleAction = ({ options, config, pipe }, ref) => {
  useImperativeHandle(ref, () => ({
    getCustomRuleConfig: () => {
      if (!timeWhenEnable || !timeWhenDisable) {
        throw Error(getLang("rule_tip_no_set_time"))
      }
      if (hasUrlTrigger && timeWhenEnable !== "none" && !urlMatchWhenEnable) {
        throw Error(getLang("rule_tip_no_set_url_method_enable"))
      }
      if (hasUrlTrigger && timeWhenDisable !== "none" && !urlMatchWhenDisable) {
        throw Error(getLang("rule_tip_no_set_url_method_disable"))
      }
      return {
        timeWhenEnable: timeWhenEnable,
        urlMatchWhenEnable: urlMatchWhenEnable,
        timeWhenDisable: timeWhenDisable,
        urlMatchWhenDisable: urlMatchWhenDisable
      }
    }
  }))

  // 启用插件的时机 none / match / notMatch
  const [timeWhenEnable, setTimeWhenEnable] = useState("none")
  // 禁用插件的时机 none / match / notMatch / closeWindow
  const [timeWhenDisable, setTimeWhenDisable] = useState("none")
  // 启用插件时，URL 的匹配方式： currentMatch / anyMatch / currentNotMatch / allNotMatch
  const [urlMatchWhenEnable, setUrlMatchWhenEnable] = useState("")
  // 禁用插件时，URL 的匹配方式： currentMatch / anyMatch / currentNotMatch / allNotMatch
  const [urlMatchWhenDisable, setUrlMatchWhenDisable] = useState("")

  // 初始化有无 URL trigger(新增规则场景)
  const triggerKeys = pipe.match.current.getSelectTriggerKeys()
  const [hasUrlTrigger, setHasUrlTrigger] = useState(triggerKeys.includes("urlTrigger"))

  // 初始化
  useEffect(() => {
    const customConfig = config.action?.custom
    if (!customConfig) {
      return
    }

    // 初始化有无 URL trigger(编辑现有规则场景)
    const hasUrl = config.match?.triggers?.find((t) => t.trigger === "urlTrigger")
    setHasUrlTrigger(Boolean(hasUrl))

    setTimeWhenEnable(customConfig.timeWhenEnable)
    setTimeWhenDisable(customConfig.timeWhenDisable)
    setUrlMatchWhenEnable(customConfig.urlMatchWhenEnable)
    setUrlMatchWhenDisable(customConfig.urlMatchWhenDisable)
  }, [config])

  // 订阅 trigger 变更的通知
  useEffect(() => {
    const emitter = ruleEmitBuilder()
    const onTriggersChanged = (triggerKeys) => {
      setHasUrlTrigger(triggerKeys.includes("urlTrigger"))
    }
    emitter.on("triggers-change", onTriggersChanged)
    return () => {
      emitter.off("triggers-change", onTriggersChanged)
    }
  }, [])

  // 配置：启用时机变化
  const onTimeWhenEnableChange = (e) => {
    const value = e.target.value
    setTimeWhenEnable(value)
    setUrlMatchWhenEnable("") // 默认
  }

  // 配置：启用时机中，URL 匹配方式变化
  const onUrlMatchWhenEnableChange = (e) => {
    const value = e.target.value
    setUrlMatchWhenEnable(value)
  }

  // 配置：禁用时机变化
  const onTimeWhenDisableChange = (e) => {
    const value = e.target.value
    setTimeWhenDisable(value)
    setUrlMatchWhenDisable("") // 默认
  }

  // 配置：禁用时机中，URL 匹配方式变化
  const onUrlMatchWhenDisableChange = (e) => {
    const value = e.target.value
    setUrlMatchWhenDisable(value)
  }

  return (
    <Style>
      <div className="steps-container">
        {/* 1 设置启用目标插件的时机 */}
        <div className="steps-item">
          <div className="steps-item-title">
            <span>{getLang("rule_set_time_of_enable")}</span>
          </div>
          <Radio.Group value={timeWhenEnable} onChange={onTimeWhenEnableChange}>
            <Radio value="none">{getLang("rule_set_when_enable_none")}</Radio>
            <Radio value="match">{getLang("rule_set_when_match")}</Radio>
            <Radio value="notMatch">{getLang("rule_set_when_not_match")}</Radio>
          </Radio.Group>
        </div>

        {/* 2 设置 URL 匹配方式 */}
        <div className="steps-item">
          <div
            className={classNames([
              "step-item-hidden",
              {
                "step-item-visible": timeWhenEnable === "match" && hasUrlTrigger
              }
            ])}>
            <div className="steps-item-title">
              <span>{getLang("rule_set_url_match_method_enable")}</span>
            </div>

            <Radio.Group value={urlMatchWhenEnable} onChange={onUrlMatchWhenEnableChange}>
              <Space direction="vertical">
                <Radio value="currentMatch">{getLang("rule_set_url_enable_current_match")}</Radio>
                <Radio value="anyMatch">{getLang("rule_set_url_enable_any_match")}</Radio>
              </Space>
            </Radio.Group>
          </div>

          <div
            className={classNames([
              "step-item-hidden",
              {
                "step-item-visible": timeWhenEnable === "notMatch" && hasUrlTrigger
              }
            ])}>
            <div className="steps-item-title">
              <span>{getLang("rule_set_url_not_match_method_enable")}</span>
            </div>
            <Radio.Group value={urlMatchWhenEnable} onChange={onUrlMatchWhenEnableChange}>
              <Space direction="vertical">
                <Radio value="currentNotMatch">
                  {getLang("rule_set_url_enable_current_not_match")}
                </Radio>
                <Radio value="allNotMatch">{getLang("rule_set_url_enable_all_not_match")}</Radio>
              </Space>
            </Radio.Group>
          </div>
        </div>

        {/* 3 设置禁用目标插件的时机 */}
        <div className="steps-item">
          <div className="steps-item-title">
            <span>{getLang("rule_set_time_of_disable")}</span>
          </div>
          <Radio.Group value={timeWhenDisable} onChange={onTimeWhenDisableChange}>
            <Radio value="none">{getLang("rule_set_when_disable_none")}</Radio>
            <Radio value="match">{getLang("rule_set_when_match")}</Radio>
            <Radio value="notMatch">{getLang("rule_set_when_not_match")}</Radio>
            {/* <Radio value="closeWindow">所有浏览器窗口关闭时</Radio> */}
          </Radio.Group>
        </div>

        {/* 4 设置 URL 匹配方式 */}
        <div className="steps-item">
          <div
            className={classNames([
              "step-item-hidden",
              {
                "step-item-visible": timeWhenDisable === "match" && hasUrlTrigger
              }
            ])}>
            <div className="steps-item-title">
              <span>{getLang("rule_set_url_match_method_disable")}</span>
            </div>
            <Radio.Group value={urlMatchWhenDisable} onChange={onUrlMatchWhenDisableChange}>
              <Space direction="vertical">
                <Radio value="currentMatch">{getLang("rule_set_url_disable_current_match")}</Radio>
                <Radio value="anyMatch">{getLang("rule_set_url_disable_any_match")}</Radio>
              </Space>
            </Radio.Group>
          </div>

          <div
            className={classNames([
              "step-item-hidden",
              {
                "step-item-visible": timeWhenDisable === "notMatch" && hasUrlTrigger
              }
            ])}>
            <div className="steps-item-title">
              <span>{getLang("rule_set_url_not_match_method_disable")}</span>
            </div>
            <Radio.Group value={urlMatchWhenDisable} onChange={onUrlMatchWhenDisableChange}>
              <Space direction="vertical">
                <Radio value="currentNotMatch">
                  {getLang("rule_set_url_disable_current_not_match")}
                </Radio>
                <Radio value="allNotMatch">{getLang("rule_set_url_disable_all_not_match")}</Radio>
              </Space>
            </Radio.Group>
          </div>
        </div>
      </div>
    </Style>
  )
}

export default memo(forwardRef(CustomRuleAction))

const Style = styled.div`
  margin: 10px 0;
  border-radius: 5px;
  border: 1px dashed #ccc;

  .steps-container {
    padding: 5px 20px 5px 5px;

    background: linear-gradient(135deg, #757f9a88, #d7dde888);
    border-radius: 5px 5px 0 0;
  }

  .steps-navigation {
    font-weight: bold;
  }

  .step-item-hidden {
    display: none;
  }

  .step-item-visible {
    display: block;
  }

  .steps-item {
    margin: 10px 0 20px 5px;

    .steps-item-title {
      display: flex;

      margin: 0px 0 5px 0;

      font-size: 14px;
      font-weight: bold;

      & span {
        align-self: center;
      }
    }
  }
`
