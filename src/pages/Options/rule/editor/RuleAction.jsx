import React, { forwardRef, memo, useEffect, useImperativeHandle, useRef, useState } from "react"

import { DownOutlined } from "@ant-design/icons"
import { Alert, Button, Checkbox, Dropdown, Radio, Space, Switch } from "antd"
import classNames from "classnames"

import EditorCommonStyle from "./CommonStyle"
import Style from "./RuleActionStyle"
import CustomRuleAction from "./ruleActions/CustomRuleAction"

const urlMatchTip =
  "默认情况下，在计算 URL 匹配时，是按照当前打开标签的 URL 计算。切换标签就会导致 URL 匹配发生变化。更多匹配方式，请在自定义中设置。"

const actionSelections = [
  {
    label: "匹配后关闭",
    key: "closeWhenMatched"
  },
  {
    label: "匹配后打开",
    key: "openWhenMatched"
  },
  {
    label: "匹配才关闭",
    key: "closeOnlyWhenMatched"
  },
  {
    label: "匹配才打开",
    key: "openOnlyWhenMatched"
  },
  {
    label: "自定义",
    key: "custom"
  }
]

const RuleAction = ({ options, config }, ref) => {
  useImperativeHandle(ref, () => ({
    // 获取配置
    getActionConfig: () => {
      if (!actionTypeKey) {
        throw Error("没有设置任何动作类型")
      }

      const actionConfig = {
        actionType: actionTypeKey,
        reloadAfterEnable: refreshAfterEnable,
        reloadAfterDisable: refreshAfterDisable
      }

      if (actionTypeKey === "custom") {
        actionConfig.customRuleConfig = customRef.getCustomRuleConfig()
      }

      return actionConfig
    }
  }))

  const customRef = useRef()

  const [actionTypeKey, setActionTypeKey] = useState("custom")
  const [actionTipMessage, setActionTipMessage] = useState("")

  const [refreshAfterEnable, setRefreshAfterEnable] = useState(false)
  const [refreshAfterDisable, setRefreshAfterDisable] = useState(false)

  // 根据配置初始化
  useEffect(() => {
    const actionConfig = config?.action
    if (!actionConfig) {
      return
    }
    setActionTypeKey(actionConfig.actionType)
    setRefreshAfterEnable(actionConfig.reloadAfterEnable ?? false)
    setRefreshAfterDisable(actionConfig.reloadAfterDisable ?? false)
  }, [config])

  useEffect(() => {
    switch (actionTypeKey) {
      case "closeWhenMatched":
        setActionTipMessage("匹配后关闭：条件匹配时，自动关闭扩展；（不会自动启用扩展）")
        break
      case "openWhenMatched":
        setActionTipMessage("匹配后打开：条件匹配时，自动打开扩展；（不会自动关闭扩展）")
        break
      case "closeOnlyWhenMatched":
        setActionTipMessage("匹配才关闭：条件匹配时，自动关闭扩展；条件不匹配时，自动打开扩展。")
        break
      case "openOnlyWhenMatched":
        setActionTipMessage("匹配才打开：条件匹配时，自动打开扩展；条件不匹配时，自动关闭扩展；")
        break
      default:
        setActionTipMessage("自定义启用或禁用扩展的时机")
    }
  }, [actionTypeKey])

  const handleActionTypeClick = (e) => {
    const key = e.target.value
    setActionTypeKey(key)
  }

  const onFreshAfterOpenChange = (e) => {
    setRefreshAfterEnable(e.target.checked)
  }

  const onFreshAfterCloseChange = (e) => {
    setRefreshAfterDisable(e.target.checked)
  }

  return (
    <EditorCommonStyle>
      <Style>
        <div className="header">
          <span className="title">3 动作</span>
        </div>

        <Alert
          className="action-tip-url-match"
          message={urlMatchTip}
          type="warning"
          showIcon
          action={
            <a
              href="https://github.com/JasonGrass/auto-extension-manager/issues"
              target="_blank"
              rel="noreferrer">
              查看帮助
            </a>
          }
        />

        <Radio.Group onChange={handleActionTypeClick} value={actionTypeKey}>
          {actionSelections.map((item) => {
            return (
              <Radio key={item.key} value={item.key}>
                {item.label}
              </Radio>
            )
          })}
        </Radio.Group>
        <Alert className="action-tip-match-type" message={actionTipMessage} type="info" showIcon />

        {actionTypeKey === "custom" && (
          <CustomRuleAction options={options} config={config} ref={customRef}></CustomRuleAction>
        )}

        <div className="action-label action-refresh-options">
          <Checkbox checked={refreshAfterEnable} onChange={onFreshAfterOpenChange}>
            启用插件之后，刷新当前页面
          </Checkbox>
          <Checkbox checked={refreshAfterDisable} onChange={onFreshAfterCloseChange}>
            禁用插件之后，刷新当前页面
          </Checkbox>
        </div>
      </Style>
    </EditorCommonStyle>
  )
}

export default memo(forwardRef(RuleAction))

export { actionSelections }
