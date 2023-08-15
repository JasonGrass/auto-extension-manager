import React, { useEffect, useState } from "react"

import chromeP from "webext-polyfill-kinda"

import { GroupOptions, ManageOptions, RuleConfigOptions, SceneOptions } from ".../storage"
import { appendAdditionInfo, filterExtensions, isExtExtension } from ".../utils/extensionHelper.js"
import Title from "../Title.jsx"
import { RuleSettingStyle } from "./RuleSettingStyle.js"
import ViewRule from "./ViewRule.jsx"

function RuleSetting() {
  const [allSceneOptions, setAllSceneOptions] = useState([])
  const [allGroupOptions, setAllGroupOptions] = useState([])
  const [managementOptions, setManagementOptions] = useState([])

  const [extensions, setExtensions] = useState([])

  const [ruleConfigs, setRuleConfigs] = useState(null)

  // 初始化
  useEffect(() => {
    SceneOptions.getAll().then((list) => {
      setAllSceneOptions(list)
    })
    GroupOptions.getGroups().then((list) => {
      setAllGroupOptions(list)
    })

    chromeP.management.getAll().then((res) => {
      const list = filterExtensions(res, isExtExtension)
      ManageOptions.get().then((options) => {
        appendAdditionInfo(list, options)
        setExtensions(list)
      })
    })

    RuleConfigOptions.get().then((list) => {
      setRuleConfigs(list)
    })

    ManageOptions.get().then((options) => {
      setManagementOptions(options)
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
    },
    duplicate: async (record) => {
      await RuleConfigOptions.duplicate(record)
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
        managementOptions={managementOptions}
        operation={operation}></ViewRule>
    </RuleSettingStyle>
  )
}

export default RuleSetting
