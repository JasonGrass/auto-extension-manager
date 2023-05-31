import classNames from "classnames"
import _ from "lodash"
import React, { useEffect, useState } from "react"

import AppList from "./AppList"
import ExtensionList from "./ExtensionListView"
import Header from "./Header"
import "./Popup.css"

function IndexPopup({ extensions, options, params }) {
  // const getI18N = chrome.i18n.getMessage

  const [initialize, setInitialize] = useState(true)
  useEffect(() => {
    setInitialize(false)
  }, [])

  return (
    <div
      style={{
        height: "100%",
        minHeight: params.minHeight
      }}>
      <Header
        activeCount={extensions.filter((ext) => ext.enabled).length}
        totalCount={extensions.length}></Header>

      <div
        className="extension-container"
        style={{ overflow: "auto", height: 560 }}>
        <div>
          <ExtensionList extensions={extensions}></ExtensionList>
        </div>
        {buildAppList()}
      </div>
    </div>
  )

  /**
   * 延迟构建 AppList UI，加快首次加载速度
   */
  function buildAppList() {
    if (initialize) {
      return null
    } else {
      return <AppList items={extensions}></AppList>
    }
  }
}

export default IndexPopup
