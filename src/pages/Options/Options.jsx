import React from "react"
import { Navigate, Route, Routes } from "react-router-dom"

import { ConfigProvider } from "antd"

import "./Options.css"
import "./index.css"

import About from "./about/About.jsx"
import GroupManagement from "./group/IndexGroup.jsx"
import ExtensionHistoryIndex from "./history/ExtensionHistoryIndex"
import ExtensionManageIndex from "./management/ExtensionManageIndex.jsx"
import ExtensionManageTable from "./management/ExtensionManageTable"
import ExtensionImport from "./management/import/ExtensionImport"
import ExtensionShare from "./management/share/ExtensionShare"
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
            <Route path="/management" element={<ExtensionManageIndex />}>
              <Route index element={<ExtensionManageTable />} />
              <Route path="share" element={<ExtensionShare />} />
              <Route path="import" element={<ExtensionImport />} />
            </Route>
            <Route path="/rule" element={<RuleSetting />} />
            <Route path="/history" element={<ExtensionHistoryIndex />} />
          </Routes>
        </ConfigProvider>
      </div>
    </div>
  )
}

export default Options
