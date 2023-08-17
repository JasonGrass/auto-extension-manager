import React, { forwardRef, memo, useEffect, useImperativeHandle, useState } from "react"

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

const RuleAction = ({ config }, ref) => {
  // useImperativeHandle(ref, () => ({
  //   // 获取配置
  //   getActionConfig: () => {
  //     if (!actionType) {
  //       throw Error("没有设置任何动作类型")
  //     }

  //     return {
  //       actionType: actionType.key,
  //       refreshAfterOpen: refreshAfterOpen,
  //       refreshAfterClose: refreshAfterClose,
  //       isAdvanceMode: isShowAdvanceOptions,
  //       timeWhenEnable: timeWhenEnable,
  //       timeWhenDisable: timeWhenDisable
  //     }
  //   }
  // }))

  const [actionTypeKey, setActionTypeKey] = useState()
  const [actionTipMessage, setActionTipMessage] = useState("custom")

  const [refreshAfterOpen, setRefreshAfterOpen] = useState(false)
  const [refreshAfterClose, setRefreshAfterClose] = useState(false)

  // 根据配置初始化
  // useEffect(() => {
  //   const action = config?.actionType
  //   if (action) {
  //     setActionType(actionSelections.filter((m) => m.key === action)[0])
  //   } else {
  //     setActionType(actionSelections[0])
  //   }

  //   setTimeWhenEnable(config?.timeWhenEnable ?? "none")
  //   setTimeWhenDisable(config?.timeWhenDisable ?? "none")
  //   setRefreshAfterOpen(config?.refreshAfterOpen ?? false)
  //   setRefreshAfterClose(config?.refreshAfterClose ?? false)
  // }, [config])

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
    setRefreshAfterOpen(e.target.checked)
  }

  const onFreshAfterCloseChange = (e) => {
    setRefreshAfterClose(e.target.checked)
  }

  return (
    <EditorCommonStyle>
      <Style>
        <div className="header">
          <span className="title">3 动作</span>
        </div>

        <Alert
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
        <Alert message={actionTipMessage} type="info" showIcon />

        <Radio.Group onChange={handleActionTypeClick} value={actionTypeKey}>
          {actionSelections.map((item) => {
            return (
              <Radio key={item.key} value={item.key}>
                {item.label}
              </Radio>
            )
          })}
        </Radio.Group>

        {actionTypeKey === "custom" && <CustomRuleAction></CustomRuleAction>}

        <div className="action-label action-refresh-options">
          <Checkbox checked={refreshAfterOpen} onChange={onFreshAfterOpenChange}>
            启用插件之后，刷新当前页面
          </Checkbox>
          <Checkbox checked={refreshAfterClose} onChange={onFreshAfterCloseChange}>
            禁用插件之后，刷新当前页面
          </Checkbox>
        </div>
      </Style>
    </EditorCommonStyle>
  )
}

export default memo(forwardRef(RuleAction))

export { actionSelections }
