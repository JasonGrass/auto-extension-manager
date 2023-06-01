import { ConfigProvider } from "antd"
import React, { useEffect, useState } from "react"

import "./Options.css"
import About from "./about/About.jsx"
import GroupManagement from "./group/Group.jsx"
import "./index.css"
import Navigation from "./navigation/Navigation.jsx"
import RuleSetting from "./rule/RuleSetting.jsx"
import Scene from "./scene/Scene.jsx"
import Settings from "./settings/Settings.jsx"

function Options() {
  const [currentNav, setCurrentNav] = useState("about")

  const onNavItemChanged = (key) => {
    if (key === currentNav) {
      return
    }
    setCurrentNav(key)
    console.log("setCurrentNav", key)
  }

  const optionContentVisible = (key) => {
    if (key === currentNav) {
      return "option-content-visible"
    } else {
      return "option-content-hidden"
    }
  }

  return (
    <div className="option-container">
      <div className="option-nav">
        <Navigation onNavItemChanged={onNavItemChanged}></Navigation>
      </div>

      <div className="option-content">
        <ConfigProvider
          theme={{
            token: {
              colorPrimary: "#337ab7"
            }
          }}>
          <div className={optionContentVisible("about")}>
            <About></About>
          </div>
          <div className={optionContentVisible("setting")}>
            <Settings></Settings>
          </div>
          <div className={optionContentVisible("scene")}>
            <Scene></Scene>
          </div>
          <div className={optionContentVisible("group")}>
            <GroupManagement></GroupManagement>
          </div>
          <div className={optionContentVisible("rule")}>
            <RuleSetting></RuleSetting>
          </div>
        </ConfigProvider>
      </div>
    </div>
  )
}

export default Options
