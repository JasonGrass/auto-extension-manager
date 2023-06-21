import React from "react"
import { Navigate, Route, Routes } from "react-router-dom"

import { ConfigProvider } from "antd"

import "./Options.css"
import "./index.css"

import About from "./about/About.jsx"
import GroupManagement from "./group/IndexGroup.jsx"
import Navigation from "./navigation/Navigation.jsx"
import RuleSetting from "./rule/RuleSetting.jsx"
import Scene from "./scene/IndexScene.jsx"
import Settings from "./settings/Settings.jsx"

function Options() {
  return (
    <div className="option-container">
      <div className="option-nav">
        <Navigation></Navigation>
      </div>

      <div className="option-content">
        <ConfigProvider
          theme={{
            token: {
              colorPrimary: "#337ab7"
            }
          }}>
          <Routes>
            <Route path="/" element={<Navigate to="/about" replace />}></Route>
            <Route path="/about" element={<About />} />
            <Route path="/setting" element={<Settings />} />
            <Route path="/scene" element={<Scene />} />
            <Route path="/group" element={<GroupManagement />} />
            <Route path="/rule" element={<RuleSetting />} />
          </Routes>
        </ConfigProvider>
      </div>
    </div>
  )
}

export default Options
