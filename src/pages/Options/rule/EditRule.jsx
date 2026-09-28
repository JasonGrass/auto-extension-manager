import React, { memo, useRef, useState } from "react"

import { Button, Input, message } from "antd"

import { getLang } from ".../utils/utils"
import Style from "./EditRuleStyle"
import EditorCommonStyle from "./editor/CommonStyle"
import ExtensionSelector from "./editor/ExtensionSelector"
import MatchRule from "./editor/MatchRule"
import RuleAction from "./editor/RuleAction"

const EditRule = memo((props) => {
  const [messageApi, contextHolder] = message.useMessage()

  const { options, config, extensions, onSave, onCancel } = props
  const matchRuleRef = useRef(null)
  const selectorRef = useRef(null)
  const actionRef = useRef(null)
  const [name, setName] = useState(config.name ?? "")

  const onSaveClick = async (e) => {
    try {
      const matchRuleConfig = matchRuleRef.current.getMatchRuleConfig()
      const selectConfig = selectorRef.current.getExtensionSelectConfig()
      const actionConfig = actionRef.current.getActionConfig()

      const newConfig = {
        name: name.trim(),
        match: matchRuleConfig,
        target: selectConfig,
        action: actionConfig,
        id: config.id,
        version: 2
      }

      // console.log("保存规则配置", newConfig)

      await onSave(newConfig)
    } catch (error) {
      console.error("保存规则配置", error)
      if (error.message.includes("QUOTA_BYTES_PER_ITEM")) {
        // message.error(getLang("rule_edit_save_error_limit"))
        // message.error("保存失败，超过浏览器存储限制")
      } else {
        messageApi.error(error.message)
      }
    }
  }

  const onHelp = () => {
    chrome.tabs.create({
      url: "https://ext.jgrass.cc/docs/rule"
    })
  }

  // 用于在几个规则配置模块中，传递数据
  const ruleSettingPipe = {
    match: matchRuleRef,
    selector: selectorRef,
    action: actionRef
  }

  return (
    <Style>
      {contextHolder}
      <EditorCommonStyle>
        <div className="editor-step-header">
          <label className="title" htmlFor="rule-name">
            {getLang("rule_name")}
          </label>
        </div>
        <Input
          className="rule-name-input"
          id="rule-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder={getLang("rule_name_placeholder")}
          allowClear
        />
      </EditorCommonStyle>
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
      <RuleAction
        options={options}
        config={config}
        ref={actionRef}
        pipe={ruleSettingPipe}></RuleAction>

      <div className="operation-box">
        <Button type="primary" onClick={onSaveClick}>
          {getLang("save")}
        </Button>
        <Button onClick={onCancel}>{getLang("cancel")}</Button>
        <Button onClick={onHelp}>{getLang("help")}</Button>
      </div>
    </Style>
  )
})

export default EditRule
