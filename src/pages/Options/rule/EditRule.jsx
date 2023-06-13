import React, { memo } from "react"

import ExtensionSelector from "./editor/ExtensionSelector"
import MatchRule from "./editor/MatchRule"
import RuleAction from "./editor/RuleAction"

const EditRule = memo(() => {
  return (
    <div>
      <MatchRule></MatchRule>
      <ExtensionSelector></ExtensionSelector>
      <RuleAction></RuleAction>
    </div>
  )
})

export default EditRule
