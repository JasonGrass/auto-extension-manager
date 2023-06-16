import React, { memo } from "react"

import { actionSelections } from "../editor/RuleAction"

const ActionView = memo(({ config }) => {
  if (!config) {
    return <span className="error-text">ERROR</span>
  }

  const action = actionSelections.filter((a) => a.key === config.actionType)[0]
  if (action) {
    return <span>{action.label}</span>
  } else {
    return <span className="error-text">UNKNOWN</span>
  }
})

export default ActionView
