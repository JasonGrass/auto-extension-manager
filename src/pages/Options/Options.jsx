import React, { useEffect, useState } from "react"
import { Navigate, Route, Routes } from "react-router-dom"

import { ConfigProvider, theme } from "antd"
import { ThemeProvider } from "styled-components"

import "./Options.css"
import "./index.css"

import storage from ".../storage/sync"
import { applyThemeToDocument, darkTheme, getAntThemeTokens, lightTheme } from ".../styles/themes"
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
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [themeReady, setThemeReady] = useState(false)

  useEffect(() => {
    storage.options.getAll().then((options) => {
      const settingMode = options?.setting?.darkMode ?? "system"
      let dark = settingMode === "dark"
      if (settingMode === "system") {
        dark = window.matchMedia("(prefers-color-scheme: dark)").matches
      }
      setIsDarkMode(dark)
      setThemeReady(true)

      applyThemeToDocument(dark ? darkTheme : lightTheme, dark)
    })
  }, [])

  if (!themeReady) {
    return null
  }

  const currentTheme = isDarkMode ? darkTheme : lightTheme

  return (
    <ConfigProvider
      theme={{
        algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: getAntThemeTokens(currentTheme)
      }}>
      <ThemeProvider theme={currentTheme}>
        <div className="option-container">
          <div className="option-nav">
            <Navigation></Navigation>
          </div>

          <div className="option-content">
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
          </div>
        </div>
      </ThemeProvider>
    </ConfigProvider>
  )
}

export default Options
