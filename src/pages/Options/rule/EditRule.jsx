import React, { memo, useEffect, useRef, useState } from "react"

import { Button, message } from "antd"

import { RuleConfigOptions, SceneOptions } from ".../storage"
import Style from "./EditRuleStyle"
import ExtensionSelector from "./editor/ExtensionSelector"
import MatchRule from "./editor/MatchRule"
import RuleAction from "./editor/RuleAction"

const EditRule = memo(() => {
  const [allSceneOptions, setAllSceneOptions] = useState([])
  const [ruleConfig, setRuleConfig] = useState({})

  const matchRuleRef = useRef(null)
  const extensionSelectorRef = useRef(null)

  useEffect(() => {
    SceneOptions.getAll().then((list) => {
      setAllSceneOptions(list)
    })
    RuleConfigOptions.get().then((list) => {
      // 测试数据，取最后一项。这个数据应该是 props 传进来的
      setRuleConfig(list.pop())
    })
  }, [])

  const onSaveClick = (e) => {
    try {
      const matchRuleConfig = matchRuleRef.current.getMatchRuleConfig()
      console.log(matchRuleConfig)

      RuleConfigOptions.addOne({
        match: matchRuleConfig
      })
    } catch (error) {
      message.error(error.message)
    }
  }

  return (
    <Style>
      <MatchRule
        sceneList={allSceneOptions}
        config={ruleConfig.match}
        ref={matchRuleRef}></MatchRule>
      <ExtensionSelector></ExtensionSelector>
      <RuleAction></RuleAction>

      <div className="operation-box">
        <Button type="primary" onClick={onSaveClick}>
          保存
        </Button>
        <Button>取消</Button>
      </div>
    </Style>
  )
})

export default EditRule
