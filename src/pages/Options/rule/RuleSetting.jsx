import React, { useEffect, useState } from "react"

import chromeP from "webext-polyfill-kinda"

import storage from ".../storage/sync"
import { appendAdditionInfo, filterExtensions, isExtExtension } from ".../utils/extensionHelper.js"
import { getLang } from ".../utils/utils"
import Title from "../Title.jsx"
import { RuleSettingStyle } from "./RuleSettingStyle.js"
import ViewRule from "./ViewRule.jsx"

function RuleSetting() {
  const [extensions, setExtensions] = useState([])

  // 所有的规则配置项，列表
  const [ruleConfigs, setRuleConfigs] = useState(null)

  // 用户配置
  const [options, setOptions] = useState({})

  // 初始化
  useEffect(() => {
    storage.options.getAll().then((options) => {
      setOptions(options)
    })

    chromeP.management.getAll().then((res) => {
      const list = filterExtensions(res, isExtExtension)
      storage.management.get().then((options) => {
        appendAdditionInfo(list, options)
        setExtensions(list)
      })
    })

    storage.rule.get().then((list) => {
      setRuleConfigs(list)
    })
  }, [])

  const updateRuleConfig = () => {
    storage.rule.get().then((list) => {
      setRuleConfigs(list)
    })
  }

  const operation = {
    delete: async (id) => {
      await storage.rule.deleteOne(id)
      updateRuleConfig()
    },
    add: async (record) => {
      await storage.rule.addOne(record)
      updateRuleConfig()
    },
    update: async (record) => {
      await storage.rule.update(record)
      updateRuleConfig()
    },
    duplicate: async (record) => {
      await storage.rule.duplicate(record)
      updateRuleConfig()
    }
  }

  return (
    <RuleSettingStyle>
      <Title title={getLang("rule_title")}></Title>

      <ViewRule
        options={options}
        configs={ruleConfigs}
        extensions={extensions}
        operation={operation}></ViewRule>
    </RuleSettingStyle>
  )
}

export default RuleSetting
