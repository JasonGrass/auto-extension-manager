import React, { memo } from "react"

import { actionSelections } from "../editor/RuleAction"

const ActionView = memo(({ config }) => {
  if (!config) {
    return <p>ERROR</p>
  }

  const action = actionSelections.filter((a) => a.key === config.actionType)[0]
  if (action) {
    return <h3>{action.label}</h3>
  } else {
    return <p>UNKNOWN</p>
  }
})

export default ActionView
