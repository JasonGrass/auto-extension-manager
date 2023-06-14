import React, { useEffect, useState } from "react"

import chromeP from "webext-polyfill-kinda"

import OptionsStorage from ".../storage/index"
import { filterExtensions, isExtExtension } from ".../utils/extensionHelper.js"
import Title from "../Title.jsx"
import EditRule from "./EditRule.jsx"
import { RuleSettingStyle } from "./RuleSettingStyle.js"

function RuleSetting() {
  const [extensions, setExtensions] = useState([])

  useEffect(() => {
    chromeP.management.getAll().then((res) => {
      const list = filterExtensions(res, isExtExtension)
      setExtensions(list)
    })
  }, [])

  return (
    <RuleSettingStyle>
      <Title title="规则设置"></Title>

      <EditRule extensions={extensions}></EditRule>
    </RuleSettingStyle>
  )
}

export default RuleSetting
