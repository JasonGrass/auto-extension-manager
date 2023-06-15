import React, { useEffect, useState } from "react"

import chromeP from "webext-polyfill-kinda"

import { GroupOptions, RuleConfigOptions, SceneOptions } from ".../storage"
import OptionsStorage from ".../storage/index"
import { filterExtensions, isExtExtension } from ".../utils/extensionHelper.js"
import Title from "../Title.jsx"
import EditRule from "./EditRule.jsx"
import { RuleSettingStyle } from "./RuleSettingStyle.js"
import ViewRule from "./ViewRule.jsx"

function RuleSetting() {
  const [extensions, setExtensions] = useState([])

  const [ruleConfigs, setRuleConfigs] = useState(null)
  const [editingConfig, setEditingConfig] = useState(null)

  useEffect(() => {
    chromeP.management.getAll().then((res) => {
      const list = filterExtensions(res, isExtExtension)
      setExtensions(list)
    })

    RuleConfigOptions.get().then((list) => {
      setRuleConfigs(list)

      // 测试数据，取最后一个
      setEditingConfig(list.pop())
    })
  }, [])

  return (
    <RuleSettingStyle>
      <Title title="规则设置"></Title>

      <ViewRule config={ruleConfigs} extensions={extensions}></ViewRule>

      <EditRule extensions={extensions} config={editingConfig}></EditRule>
    </RuleSettingStyle>
  )
}

export default RuleSetting
