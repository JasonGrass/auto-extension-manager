import React from "react"
import { createRoot } from "react-dom/client"

import "antd/dist/reset.css"

import { message } from "antd"
import { ConfigProvider, theme } from "antd"
import { ThemeProvider } from "styled-components"
import chromeP from "webext-polyfill-kinda"

import "./index.css"

import { getPopupWidth } from ".../pages/Popup/utils/popupLayoutHelper"
import storage from ".../storage/sync"
import { appendAdditionInfo } from ".../utils/extensionHelper"
import { ExtensionIconBuilder } from "../Background/extension/ExtensionIconBuilder"
import Popup from "./Components/Popup"

const container = document.getElementById("app-container")
const root = createRoot(container)

const prepare = async function () {
  let allExtensions = await chromeP.management.getAll()
  const allOptions = await storage.options.getAll()

  // 如果关闭了在 Popup 中显示固定分组中的扩展，则隐藏这些扩展
  if (!(allOptions.setting.isShowFixedExtension ?? true)) {
    const fixedGroup = allOptions.groups.find((g) => g.id === "fixed")
    if (fixedGroup && fixedGroup.extensions) {
      allExtensions = allExtensions.filter((ext) => !fixedGroup.extensions.includes(ext.id))
    }
  }
  // 不展示主题类的扩展
  allExtensions = allExtensions.filter((ext) => ext.type !== "theme")
  // 不展示自己
  const self = await chromeP.management.getSelf()
  allExtensions = allExtensions.filter((ext) => ext.id !== self.id)

  const extensions = appendAdditionInfo(allExtensions, allOptions.management)

  // popup 宽度设置
  document.body.style.width = getPopupWidth(
    allOptions.setting.layout,
    allExtensions.count,
    allOptions.setting.columnCountInGirdView
  )

  return {
    // 插件信息
    extensions: extensions,
    // 用户配置信息
    options: allOptions,
    // 运行时临时参数
    params: {}
  }
}

const storageViewApi = storage.helper.view.getApi()
storageViewApi.message = message

const styled_light_theme = {
  bg: "#FFF",
  fg: "#222",
  input_border: "#ccc",
  enable_text: "#333",
  disable_text: "#aaa",
  btn_bg: "#f5f5f5",
  btn_hover_bg: "#23bfc588"
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
  let isDarkMode = props.options.setting.darkMode === "dark"
  if (props.options.setting.darkMode === "system") {
    isDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches
  }

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
