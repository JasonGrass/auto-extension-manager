import React, { useState } from "react"
import { NavLink } from "react-router-dom"

import {
  FilterFilled,
  FolderOpenFilled,
  FormatPainterFilled,
  ReconciliationFilled,
  ThunderboltFilled,
  ToolFilled
} from "@ant-design/icons"

import analytics from ".../utils/googleAnalyze"
import { getLang } from ".../utils/utils"
import { NavigationStyle } from "./NavigationStyle"

function Navigation() {
  const reportEvent = (title) => {
    analytics.firePageViewEvent(title)
  }

  return (
    <NavigationStyle>
      <NavLink to="">
        <h1>Extension Manager</h1>
      </NavLink>

      <NavLink to="/setting" className="nav-item" onClick={() => reportEvent("setting")}>
        <ToolFilled />
        <span className="text">{getLang("setting_title")}</span>
      </NavLink>

      <NavLink to="/scene" className="nav-item" onClick={() => reportEvent("scene")}>
        <ThunderboltFilled />
        <span className="text">{getLang("scene_title")}</span>
      </NavLink>

      <NavLink to="/group" className="nav-item" onClick={() => reportEvent("group")}>
        <FolderOpenFilled />
        <span className="text">{getLang("group_title")}</span>
      </NavLink>

      <NavLink to="/management" className="nav-item" onClick={() => reportEvent("management")}>
        <FormatPainterFilled />
        <span className="text">{getLang("alias_title")}</span>
      </NavLink>

      <NavLink to="/rule" className="nav-item" onClick={() => reportEvent("rule")}>
        <FilterFilled />
        <span className="text">{getLang("rule_title")}</span>
      </NavLink>

      <NavLink to="/history" className="nav-item" onClick={() => reportEvent("history")}>
        <ReconciliationFilled />
        <span className="text">{getLang("history_title")}</span>
      </NavLink>
    </NavigationStyle>
  )
}

export default Navigation
