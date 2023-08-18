import React, { forwardRef, memo, useEffect, useImperativeHandle, useState } from "react"

import { Alert, Button, Checkbox, Dropdown, Radio, Space, Steps, Switch } from "antd"
import classNames from "classnames"
import { styled } from "styled-components"

const CustomRuleAction = ({ options, config }, ref) => {
  useImperativeHandle(ref, () => ({
    getCustomRuleConfig: () => {
      if (!timeWhenEnable || !timeWhenDisable) {
        throw Error("没有指定启用或禁用扩展的时机")
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

  useEffect(() => {
    const customConfig = config.action?.custom
    if (!customConfig) {
      return
    }
    setTimeWhenEnable(customConfig.timeWhenEnable)
    setTimeWhenDisable(customConfig.timeWhenDisable)
    setUrlMatchWhenEnable(customConfig.urlMatchWhenEnable)
    setUrlMatchWhenDisable(customConfig.urlMatchWhenDisable)
  }, [config])

  // 配置：启用时机变化
  const onTimeWhenEnableChange = (e) => {
    const value = e.target.value
    setTimeWhenEnable(value)

    if (value === "match") {
      setUrlMatchWhenEnable("currentMatch") // 默认
    } else if (value === "notMatch") {
      setUrlMatchWhenEnable("currentNotMatch") // 默认
    } else {
      setUrlMatchWhenEnable("")
    }
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

    if (value === "match") {
      setUrlMatchWhenDisable("currentMatch") // 默认
    } else if (value === "notMatch") {
      setUrlMatchWhenDisable("currentNotMatch") // 默认
    } else {
      setUrlMatchWhenDisable("")
    }
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
            <span>（启用插件）设置启用目标插件的时机</span>
          </div>
          <Radio.Group value={timeWhenEnable} onChange={onTimeWhenEnableChange}>
            <Radio value="none">不自动启用</Radio>
            <Radio value="match">条件匹配时</Radio>
            <Radio value="notMatch">条件不匹配时</Radio>
          </Radio.Group>
        </div>

        {/* 2 设置 URL 匹配方式 */}
        <div className="steps-item">
          <div className={classNames({ "step-item-hidden": timeWhenEnable !== "match" })}>
            <div className="steps-item-title">
              <span>（启用插件）URL 匹配的计算方式</span>
            </div>

            <Radio.Group value={urlMatchWhenEnable} onChange={onUrlMatchWhenEnableChange}>
              <Space direction="vertical">
                <Radio value="currentMatch">
                  当前标签匹配（只有当前标签页匹配时，扩展才会被开启）
                </Radio>
                <Radio value="anyMatch">
                  任一标签匹配（所有标签中任一标签页匹配时，扩展就会被开启）
                </Radio>
              </Space>
            </Radio.Group>
          </div>

          <div className={classNames({ "step-item-hidden": timeWhenEnable !== "notMatch" })}>
            <div className="steps-item-title">
              <span>（启用插件）URL 不匹配的计算方式</span>
            </div>
            <Radio.Group value={urlMatchWhenEnable} onChange={onUrlMatchWhenEnableChange}>
              <Space direction="vertical">
                <Radio value="currentNotMatch">
                  当前标签不匹配（只要当前标签不匹配，扩展就会被开启）
                </Radio>
                <Radio value="allNotMatch">
                  所有标签不匹配（只有所有标签都不匹配，扩展才会被开启）
                </Radio>
              </Space>
            </Radio.Group>
          </div>
        </div>

        {/* 3 设置禁用目标插件的时机 */}
        <div className="steps-item">
          <div className="steps-item-title">
            <span>（禁用插件）设置禁用目标插件的时机</span>
          </div>
          <Radio.Group value={timeWhenDisable} onChange={onTimeWhenDisableChange}>
            <Radio value="none">不自动启用</Radio>
            <Radio value="match">条件匹配时</Radio>
            <Radio value="notMatch">条件不匹配时</Radio>
            <Radio value="closeWindow">所有浏览器窗口关闭时</Radio>
          </Radio.Group>
        </div>

        {/* 4 设置 URL 匹配方式 */}
        <div className="steps-item">
          <div className={classNames({ "step-item-hidden": timeWhenDisable !== "match" })}>
            <div className="steps-item-title">
              <span>（禁用插件）URL 匹配的计算方式</span>
            </div>
            <Radio.Group value={urlMatchWhenDisable} onChange={onUrlMatchWhenDisableChange}>
              <Space direction="vertical">
                <Radio value="currentMatch">
                  当前标签匹配（只有当前标签页匹配时，扩展才会被禁用）
                </Radio>
                <Radio value="anyMatch">
                  任一标签匹配（所有标签中任一标签页匹配时，扩展就会被禁用）
                </Radio>
              </Space>
            </Radio.Group>
          </div>

          <div className={classNames({ "step-item-hidden": timeWhenDisable !== "notMatch" })}>
            <div className="steps-item-title">
              <span>（禁用插件）URL 不匹配的计算方式</span>
            </div>
            <Radio.Group value={urlMatchWhenDisable} onChange={onUrlMatchWhenDisableChange}>
              <Space direction="vertical">
                <Radio value="currentNotMatch">
                  当前标签不匹配（只要当前标签不匹配，扩展就会被禁用）
                </Radio>
                <Radio value="allNotMatch">
                  所有标签不匹配（只有所有标签都不匹配，扩展才会被禁用）
                </Radio>
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
