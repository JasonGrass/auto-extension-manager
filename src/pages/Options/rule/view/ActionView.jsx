import React, { memo } from "react"

import { getLang } from ".../utils/utils"
import { actionSelections } from "../editor/RuleAction"

const ActionView = memo(({ config }) => {
  if (!config) {
    return <span className="error-text">ERROR</span>
  }

  let label = undefined
  if (config.isAdvanceMode) {
    label = "Advanced settings"
  } else {
    const action = actionSelections.filter((a) => a.key === config.actionType)[0]
    if (action) {
      const showOnTopText = getLang("rule_action_top_title")

      if (action.key === "none" && config.showOnTheTop) {
        label = showOnTopText
      } else if (config.showOnTheTop) {
        label = `${action.label} & ${showOnTopText}`
      } else {
        label = action.label
      }
    }
  }

  if (config.showOnTheTop) {
  }

  if (label) {
    return <span>{label}</span>
  } else {
    return <span className="error-text">UNKNOWN</span>
  }
})

export default ActionView
