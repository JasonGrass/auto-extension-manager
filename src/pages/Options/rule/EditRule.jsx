import React, { memo, useRef } from "react"

import { Button, message } from "antd"

import Style from "./EditRuleStyle"
import ExtensionSelector from "./editor/ExtensionSelector"
import MatchRule from "./editor/MatchRule"
import RuleAction from "./editor/RuleAction"

const EditRule = memo((props) => {
  const { options, config, extensions, onSave, onCancel } = props
  const matchRuleRef = useRef(null)
  const selectorRef = useRef(null)
  const actionRef = useRef(null)

  const onSaveClick = (e) => {
    try {
      const matchRuleConfig = matchRuleRef.current.getMatchRuleConfig()
      const selectConfig = selectorRef.current.getExtensionSelectConfig()
      const actionConfig = actionRef.current.getActionConfig()

      const newConfig = {
        match: matchRuleConfig,
        target: selectConfig,
        action: actionConfig,
        id: config.id,
        version: 2
      }

      console.log("保存规则配置", newConfig)

      onSave(newConfig)
    } catch (error) {
      message.error(error.message)
    }
  }

  const onHelp = () => {
    chrome.tabs.create({
      url: "https://github.com/JasonGrass/auto-extension-manager/wiki"
    })
  }

  return (
    <Style>
      {/* 1 匹配条件 */}
      <MatchRule options={options} config={config} ref={matchRuleRef} />

      {/* 2 目标 */}
      <ExtensionSelector
        options={options}
        config={config}
        extensions={extensions}
        ref={selectorRef}
      />

      {/* 3 动作 */}
      <RuleAction options={options} config={config} ref={actionRef}></RuleAction>

      <div className="operation-box">
        <Button type="primary" onClick={onSaveClick}>
          保存
        </Button>
        <Button onClick={onCancel}>取消</Button>
        <Button onClick={onHelp}>帮助</Button>
      </div>
    </Style>
  )
})

export default EditRule
