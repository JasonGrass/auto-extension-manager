import "../../wdyr"

import React from "react"
import { createRoot } from "react-dom/client"

import "antd/dist/reset.css"

import { message } from "antd"
import { ConfigProvider, theme } from "antd"
import { ThemeProvider } from "styled-components"

import "./index.css"

import storage from ".../storage/sync"
import { getAntThemeComponents, getAntThemeTokens } from ".../styles/themes"
import useAppTheme from ".../styles/useAppTheme"
import { isEdgePackage, isEdgeRuntime } from ".../utils/channelHelper"
import analytics from ".../utils/googleAnalyze"
import { getLang } from ".../utils/googleAnalyzeHelper"
import { ExtensionIconBuilder } from "../Background/extension/ExtensionIconBuilder"
import Popup from "./Components/Popup"
import { prepare } from "./prepare"

const container = document.getElementById("app-container")
const root = createRoot(container)

const storageViewApi = storage.helper.view.getApi()
storageViewApi.message = message

function PopupApp({ prepared }) {
  const { currentTheme, isDarkMode, themeReady } = useAppTheme()
  if (!themeReady) return null
  return (
    <ConfigProvider
      theme={{
        algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: getAntThemeTokens(currentTheme),
        components: getAntThemeComponents(currentTheme)
      }}>
      <ThemeProvider theme={currentTheme}>
        <Popup
          style={{ height: "100%" }}
          originExtensions={prepared.extensions}
          options={prepared.options}
          params={{ ...prepared.params, isDarkMode }}
        />
      </ThemeProvider>
    </ConfigProvider>
  )
}

prepare().then((props) => {
  root.render(<PopupApp prepared={props} />)
  fireEvent(props)
})

ExtensionIconBuilder.build()

function fireEvent(props) {
  const firePopupOpen = async () => {
    const version = chrome.runtime.getManifest().version
    const ul = await getLang()
    analytics.fireEvent("page_view_popup", {
      browser: isEdgeRuntime() ? "edge" : "chrome",
      package: isEdgePackage() ? "edge" : "chrome",
      version: version,
      layout: props.options.setting.layout,
      display: props.options.setting.isDisplayByGroup ? "byGroup" : "byEnabled",
      groupExclusive: props.options.setting.isEnableCurrentGroupAndDisableOthers
        ? "enabled"
        : "disabled",
      menuDisplay: props.options.setting.isMenuDisplayByRightClick ? "rightClick" : "hover",
      lang: ul
    })
  }
  // Fire a page view event on load
  if (document.readyState === "complete") {
    firePopupOpen()
  } else {
    window.addEventListener("load", firePopupOpen, {
      once: true
    })
  }
}
