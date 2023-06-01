import React, { useEffect, useState } from "react"

import optionsStorage from ".../storage/index"
import Title from "../Title.jsx"
import { RuleSettingStyle } from "./RuleSettingStyle.js"

function RuleSetting() {
  return (
    <RuleSettingStyle>
      <Title title="规则设置"></Title>
    </RuleSettingStyle>
  )
}

export default RuleSetting
