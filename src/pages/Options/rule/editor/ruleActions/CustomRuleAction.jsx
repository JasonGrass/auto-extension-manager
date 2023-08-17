import React, { forwardRef, memo, useEffect, useImperativeHandle, useState } from "react"

import { Alert, Button, Checkbox, Dropdown, Radio, Space, Steps, Switch } from "antd"
import classNames from "classnames"
import { styled } from "styled-components"

const CustomRuleAction = ({ options, config }, ref) => {
  const [step1] = useState({
    index: 1,
    key: "time-when-enable",
    enable: true
  })
  const [step2, setStep2] = useState({
    index: 2,
    key: "url-match-when-enable",
    enable: false
  })
  const [step3] = useState({
    index: 3,
    key: "time-when-disable",
    enable: true
  })
  const [step4, setStep4] = useState({
    index: 4,
    key: "url-match-when-disable",
    enable: false
  })

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

  const [currentStep, setCurrentStep] = useState(step1)
  const [hasPrevious, setHasPrevious] = useState(false)
  const [hasNext, setHasNext] = useState(true)

  const [resultDescription, setResultDescription] = useState("")

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

  useEffect(() => {
    if (currentStep.index === 1) {
      setHasPrevious(false)
      setHasNext(true)
    } else if (currentStep.index === 2) {
      setHasPrevious(true)
      setHasNext(true)
    } else if (currentStep.index === 3) {
      setHasPrevious(true)
      setHasNext(step4.enable)
    } else if (currentStep.index === 4) {
      setHasPrevious(true)
      setHasNext(false)
    }
  }, [currentStep, step4])

  useEffect(() => {
    let result = "🌳"

    if (timeWhenEnable === "none") {
      result += "启用插件的时机：不自动启用"
    } else if (timeWhenEnable === "match") {
      result += "启用插件的时机：条件匹配时启用"
    } else if (timeWhenEnable === "notMatch") {
      result += "启用插件的时机：条件不匹配时启用"
    }

    if (urlMatchWhenEnable === "currentMatch") {
      result += ` (其中 URL 匹配的规则为：当前标签匹配才算匹配)`
    } else if (urlMatchWhenEnable === "anyMatch") {
      result += ` (其中 URL 匹配的规则为：任一标签匹配就算匹配)`
    } else if (urlMatchWhenEnable === "currentNotMatch") {
      result += ` (其中 URL 不匹配的规则为：当前标签不匹配就算不匹配)`
    } else if (urlMatchWhenEnable === "allNotMatch") {
      result += ` (其中 URL 不匹配的规则为：所有标签不匹配才算不匹配)`
    }

    result += "; 🌳"

    if (timeWhenDisable === "none") {
      result += "禁用插件的时机：不自动禁用"
    } else if (timeWhenDisable === "match") {
      result += "禁用插件的时机：条件匹配时禁用"
    } else if (timeWhenDisable === "notMatch") {
      result += "禁用插件的时机：条件不匹配时禁用"
    } else if (timeWhenDisable === "closeWindow") {
      result += "禁用插件的时机：关闭所有浏览器窗口时禁用"
    }

    if (urlMatchWhenDisable === "currentMatch") {
      result += ` (其中 URL 匹配的规则为：当前标签匹配才算匹配)`
    } else if (urlMatchWhenDisable === "anyMatch") {
      result += ` (其中 URL 匹配的规则为：任一标签匹配就算匹配)`
    } else if (urlMatchWhenDisable === "currentNotMatch") {
      result += ` (其中 URL 不匹配的规则为：当前标签不匹配就算不匹配)`
    } else if (urlMatchWhenDisable === "allNotMatch") {
      result += ` (其中 URL 不匹配的规则为：所有标签不匹配才算不匹配)`
    }

    setResultDescription(result)
  }, [timeWhenEnable, timeWhenDisable, urlMatchWhenEnable, urlMatchWhenDisable])

  // 配置：启用时机变化
  const onTimeWhenEnableChange = (e) => {
    const value = e.target.value
    setTimeWhenEnable(value)
    if (value === "none") {
      setStep2({ ...step2, enable: false })
    } else {
      setStep2({ ...step2, enable: true })
    }

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
    if (value === "none" || value === "closeWindow") {
      setStep4({ ...step4, enable: false })
    } else {
      setStep4({ ...step4, enable: true })
    }

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

  // 点击下一步
  const next = () => {
    if (currentStep.index === 1) {
      if (step2.enable) {
        setCurrentStep(step2)
      } else {
        setCurrentStep(step3)
      }
    }

    if (currentStep.index === 2) {
      setCurrentStep(step3)
    }

    if (currentStep.index === 3) {
      if (step4.enable) {
        setCurrentStep(step4)
      } else {
        throw Error("step 4 不可用，此处不应该执行")
      }
    }
  }

  // 点击上一步
  const prev = () => {
    if (currentStep.index === 4) {
      setCurrentStep(step3)
    }

    if (currentStep.index === 3) {
      if (step2.enable) {
        setCurrentStep(step2)
      } else {
        setCurrentStep(step1)
      }
    }

    if (currentStep.index === 2) {
      setCurrentStep(step1)
    }
  }

  return (
    <Style>
      <div className="steps-container">
        {/* 1 设置启用目标插件的时机 */}
        <div className="steps-item" style={{ display: currentStep.index === 1 ? "block" : "none" }}>
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
        <div className="steps-item" style={{ display: currentStep.index === 2 ? "block" : "none" }}>
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
        <div className="steps-item" style={{ display: currentStep.index === 3 ? "block" : "none" }}>
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
        <div className="steps-item" style={{ display: currentStep.index === 4 ? "block" : "none" }}>
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

        <div>
          {hasNext && (
            <Button className="steps-button" size="small" type="primary" onClick={() => next()}>
              下一步
            </Button>
          )}
          {hasPrevious && (
            <Button className="steps-button" size="small" onClick={() => prev()}>
              上一步
            </Button>
          )}
          {/* {!hasNext && (
            <Button className="steps-button" size="small" type="primary">
              完成
            </Button>
          )} */}
        </div>
      </div>
      <div className="result-description">
        <span>自定义结果：</span>
        <p>{resultDescription}</p>
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
    height: 80px;
    margin: 3px 0 0 10px;

    .steps-item-title {
      display: flex;

      margin-bottom: 20px;

      font-size: 14px;
      font-weight: bold;

      & span {
        align-self: center;
      }
    }
  }

  .steps-button {
    width: 100px;
    margin: 20px 10px 5px 10px;
  }

  .result-description {
    p {
      margin: 0;
      padding: 0;
    }
    padding: 5px 0 5px 15px;
    font-size: 14px;
    line-height: 24px;
  }
`
