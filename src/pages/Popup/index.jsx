import "../../wdyr"

import React from "react"
import { createRoot } from "react-dom/client"

import "antd/dist/reset.css"

import { message } from "antd"
import { ConfigProvider, theme } from "antd"
import { ThemeProvider } from "styled-components"

import "./index.css"

import storage from ".../storage/sync"
import { ExtensionIconBuilder } from "../Background/extension/ExtensionIconBuilder"
import Popup from "./Components/Popup"
import { prepare } from "./prepare"

const container = document.getElementById("app-container")
const root = createRoot(container)

const storageViewApi = storage.helper.view.getApi()
storageViewApi.message = message

const styled_light_theme = {
  bg: "#FFF",
  fg: "#222",
  input_border: "#ccc",
  enable_text: "#333",
  disable_text: "#aaa",
  btn_bg: "#f5f5f5",
  btn_hover_bg: "#dfdfdf"
}

const styled_dark_theme = {
  bg: "#242529",
  fg: "#C9CACF",
  input_border: "#3a3a3a",
  enable_text: "#ccc",
  disable_text: "#777",
  btn_bg: "#313131",
  btn_hover_bg: "#474747"
}

prepare().then((props) => {
  const settingMode = props.options.setting.darkMode ?? "system" // 默认跟随系统
  let isDarkMode = settingMode === "dark"
  if (settingMode === "system") {
    isDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches
  }

  props.params.isDarkMode = isDarkMode

  root.render(
    <ConfigProvider
      theme={{
        algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm
      }}>
      <ThemeProvider theme={isDarkMode ? styled_dark_theme : styled_light_theme}>
        <Popup
          style={{ height: "100%" }}
          originExtensions={props.extensions}
          options={props.options}
          params={props.params}
        />
      </ThemeProvider>
    </ConfigProvider>
  )
})

ExtensionIconBuilder.build()
