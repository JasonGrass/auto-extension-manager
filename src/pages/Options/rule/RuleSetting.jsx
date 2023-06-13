import React, { useEffect, useState } from "react"

import OptionsStorage from ".../storage/index"
import Title from "../Title.jsx"
import EditRule from "./EditRule.jsx"
import { RuleSettingStyle } from "./RuleSettingStyle.js"

function RuleSetting() {
  return (
    <RuleSettingStyle>
      <Title title="规则设置"></Title>

      <EditRule></EditRule>
    </RuleSettingStyle>
  )
}

export default RuleSetting
