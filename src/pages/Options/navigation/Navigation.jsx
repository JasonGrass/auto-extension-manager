import React, { useState } from "react"
import { NavLink } from "react-router-dom"

import { FilterFilled, FolderOpenFilled, ThunderboltFilled, ToolFilled } from "@ant-design/icons"

import { NavigationStyle } from "./NavigationStyle"

function Navigation() {
  return (
    <NavigationStyle>
      <NavLink to="">
        <h1>Extension Manager</h1>
      </NavLink>

      <NavLink to="/setting" className="nav-item">
        <ToolFilled />
        <span className="text">通用设置</span>
      </NavLink>

      <NavLink to="/scene" className="nav-item">
        <ThunderboltFilled />
        <span className="text">情景模式</span>
      </NavLink>

      <NavLink to="/group" className="nav-item">
        <FolderOpenFilled />
        <span className="text">分组管理</span>
      </NavLink>

      <NavLink to="/management" className="nav-item">
        <FolderOpenFilled />
        <span className="text">插件管理</span>
      </NavLink>

      <NavLink to="/rule" className="nav-item">
        <FilterFilled />
        <span className="text">规则设置</span>
      </NavLink>
    </NavigationStyle>
  )
}

export default Navigation
