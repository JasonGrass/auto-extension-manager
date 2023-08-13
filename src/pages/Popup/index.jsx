import React from "react"
import { createRoot } from "react-dom/client"

import "antd/dist/reset.css"

import chromeP from "webext-polyfill-kinda"

import "./index.css"

import { appendAdditionInfo } from ".../utils/extensionHelper"
import OptionsStorage, { LocalOptionsStorage, ManageOptions } from "../../storage/index"
import Popup from "./Components/Popup"

const container = document.getElementById("app-container")
const root = createRoot(container)

document.body.style.width = "400px"

const prepare = async function () {
  const allExtensions = await chromeP.management.getAll()
  const managementOptions = await ManageOptions.get()
  const extensions = appendAdditionInfo(allExtensions, managementOptions)

  const allOptions = await OptionsStorage.getAll()
  const localOptions = await LocalOptionsStorage.getAll()
  const minHeight = Math.min(600, Math.max(200, allExtensions.length * 40))

  return {
    // 插件信息
    extensions: extensions,
    // 用户配置信息
    options: { ...allOptions, local: localOptions },
    // 运行时临时参数
    params: {
      minHeight: minHeight
    }
  }
}

// chromeP.management.getAll().then((all) => {
//   root.render(<Popup initialExtensions={all} />)
// })

prepare().then((props) => {
  root.render(<Popup extensions={props.extensions} options={props.options} params={props.params} />)
})
