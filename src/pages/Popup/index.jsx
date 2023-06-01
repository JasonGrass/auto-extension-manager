import "antd/dist/reset.css"
import React from "react"
import { createRoot } from "react-dom/client"
import chromeP from "webext-polyfill-kinda"

import OptionsStorage from "../../storage/index"
import Popup from "./Components/Popup"
import "./index.css"

const container = document.getElementById("app-container")
const root = createRoot(container)

document.body.style.width = "400px"

const prepare = async function () {
  const allExtensions = await chromeP.management.getAll()
  const allOptions = await OptionsStorage.getAll()
  const minHeight = Math.min(600, Math.max(200, allExtensions.length * 40))

  return {
    // 插件信息
    extensions: allExtensions,
    // 用户配置信息
    options: allOptions,
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
  root.render(
    <Popup
      extensions={props.extensions}
      options={props.options}
      params={props.params}
    />
  )
})
