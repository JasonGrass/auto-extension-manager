import {
  FilterFilled,
  FolderOpenFilled,
  ThunderboltFilled,
  ToolFilled
} from "@ant-design/icons"
import React, { useState } from "react"

import { NavigationStyle } from "./NavigationStyle"

function Navigation({ onNavItemChanged }) {
  const [currentTab, setCurrentTab] = useState("about")

  const onNavClick = (e, name) => {
    setCurrentTab(name)
    if (onNavItemChanged) {
      onNavItemChanged(name)
    }
  }

  const activeClassName = (name) => {
    if (name === currentTab) {
      return "active"
    } else {
      return null
    }
  }

  const navList = [
    {
      key: "setting",
      text: "通用设置",
      icon: <ToolFilled />
    },
    {
      key: "scene",
      text: "情景模式",
      icon: <ThunderboltFilled />
    },
    {
      key: "group",
      text: "分组管理",
      icon: <FolderOpenFilled />
    },
    {
      key: "rule",
      text: "规则设置",
      icon: <FilterFilled />
    }
  ]

  return (
    <NavigationStyle>
      <h1 onClick={(e) => onNavClick(e, "about")}>Extension Manager</h1>

      <ul>
        {navList.map((item) => {
          return (
            <li
              key={item.key}
              className={activeClassName(item.key)}
              onClick={(e) => onNavClick(e, item.key)}>
              {item.icon}
              <span className="text">{item.text}</span>
            </li>
          )
        })}
      </ul>
    </NavigationStyle>
  )
}

export default Navigation
