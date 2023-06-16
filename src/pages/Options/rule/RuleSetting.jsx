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
  const [allSceneOptions, setAllSceneOptions] = useState([])
  const [allGroupOptions, setAllGroupOptions] = useState([])

  const [extensions, setExtensions] = useState([])

  const [ruleConfigs, setRuleConfigs] = useState(null)

  useEffect(() => {
    SceneOptions.getAll().then((list) => {
      setAllSceneOptions(list)
    })
    GroupOptions.getGroups().then((list) => {
      setAllGroupOptions(list)
    })

    chromeP.management.getAll().then((res) => {
      const list = filterExtensions(res, isExtExtension)
      setExtensions(list)
    })

    RuleConfigOptions.get().then((list) => {
      setRuleConfigs(list)
    })
  }, [])

  const updateRuleConfig = () => {
    RuleConfigOptions.get().then((list) => {
      setRuleConfigs(list)
    })
  }

  const operation = {
    delete: async (id) => {
      await RuleConfigOptions.deleteOne(id)
      updateRuleConfig()
    },
    add: async (record) => {
      await RuleConfigOptions.addOne(record)
      updateRuleConfig()
    },
    update: async (record) => {
      await RuleConfigOptions.update(record)
      updateRuleConfig()
    }
  }

  return (
    <RuleSettingStyle>
      <Title title="规则设置"></Title>

      <ViewRule
        config={ruleConfigs}
        extensions={extensions}
        sceneOption={allSceneOptions}
        groupOption={allGroupOptions}
        operation={operation}></ViewRule>
    </RuleSettingStyle>
  )
}

export default RuleSetting
