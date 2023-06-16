import React, { memo, useEffect, useRef, useState } from "react"

import { Button, message } from "antd"

import { GroupOptions, RuleConfigOptions, SceneOptions } from ".../storage"
import Style from "./EditRuleStyle"
import ExtensionSelector from "./editor/ExtensionSelector"
import MatchRule from "./editor/MatchRule"
import RuleAction from "./editor/RuleAction"

const EditRule = memo((props) => {
  const { extensions, config, sceneOption, groupOption, onSave, onCancel } =
    props
  const matchRuleRef = useRef(null)
  const selectorRef = useRef(null)
  const actionRef = useRef(null)

  if (!config) {
    return null
  }

  const onSaveClick = (e) => {
    try {
      const matchRuleConfig = matchRuleRef.current.getMatchRuleConfig()
      const selectConfig = selectorRef.current.getExtensionSelectConfig()
      const actionConfig = actionRef.current.getActionConfig()

      console.log(matchRuleConfig)
      console.log(selectConfig)
      console.log(actionConfig)

      const newConfig = {
        match: matchRuleConfig,
        target: selectConfig,
        action: actionConfig,
        id: config.id
      }

      onSave(newConfig)
    } catch (error) {
      message.error(error.message)
    }
  }

  return (
    <Style>
      <MatchRule
        sceneList={sceneOption}
        config={config?.match}
        ref={matchRuleRef}
      />

      <ExtensionSelector
        groupList={groupOption}
        extensions={extensions}
        config={config?.target}
        ref={selectorRef}
      />

      <RuleAction config={config?.action} ref={actionRef}></RuleAction>

      <div className="operation-box">
        <Button type="primary" onClick={onSaveClick}>
          保存
        </Button>
        <Button onClick={onCancel}>取消</Button>
      </div>
    </Style>
  )
})

export default EditRule
