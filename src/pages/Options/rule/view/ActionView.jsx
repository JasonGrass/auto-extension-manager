import React, { memo } from "react"

import { actionSelections } from "../editor/RuleAction"

const ActionView = memo(({ config }) => {
  if (!config) {
    return <span className="error-text">ERROR</span>
  }

  let label = undefined
  if (config.isAdvanceMode) {
    label = "Advance"
  } else {
    const action = actionSelections.filter(
      (a) => a.key === config.actionType
    )[0]
    if (action) {
      label = action.label
    }
  }

  if (label) {
    return <span>{label}</span>
  } else {
    return <span className="error-text">UNKNOWN</span>
  }
})

export default ActionView
