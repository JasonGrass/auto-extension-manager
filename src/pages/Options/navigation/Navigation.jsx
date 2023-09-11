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

import { getLang } from ".../utils/utils"
import { NavigationStyle } from "./NavigationStyle"

function Navigation() {
  return (
    <NavigationStyle>
      <NavLink to="">
        <h1>Extension Manager</h1>
      </NavLink>

      <NavLink to="/setting" className="nav-item">
        <ToolFilled />
        <span className="text">{getLang("setting_title")}</span>
      </NavLink>

      <NavLink to="/scene" className="nav-item">
        <ThunderboltFilled />
        <span className="text">{getLang("scene_title")}</span>
      </NavLink>

      <NavLink to="/group" className="nav-item">
        <FolderOpenFilled />
        <span className="text">{getLang("group_title")}</span>
      </NavLink>

      <NavLink to="/management" className="nav-item">
        <FormatPainterFilled />
        <span className="text">{getLang("alias_title")}</span>
      </NavLink>

      <NavLink to="/rule" className="nav-item">
        <FilterFilled />
        <span className="text">{getLang("rule_title")}</span>
      </NavLink>

      <NavLink to="/history" className="nav-item">
        <ReconciliationFilled />
        <span className="text">{getLang("history_title")}</span>
      </NavLink>
    </NavigationStyle>
  )
}

export default Navigation
