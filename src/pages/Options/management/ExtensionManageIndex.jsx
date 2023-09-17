import React, { useEffect, useState } from "react"

import chromeP from "webext-polyfill-kinda"

import storage from ".../storage/sync"
import { filterExtensions, isExtExtension } from ".../utils/extensionHelper.js"
import { getLang } from "../../../utils/utils.js"
import Title from "../Title.jsx"
import ExtensionManage from "./ExtensionManage.jsx"

const ExtensionManageIndex = () => {
  const [extensions, setExtensions] = useState([])
  const [managementConfig, setManagementConfig] = useState({})

  useEffect(() => {
    chromeP.management.getAll().then((res) => {
      const list = filterExtensions(res, isExtExtension)
      setExtensions(list)
    })

    storage.management.get().then((res) => {
      setManagementConfig(res)
    })
  }, [])

  return (
    <div>
      <Title title={getLang("alias_title")}></Title>
      <ExtensionManage extensions={extensions} config={managementConfig}></ExtensionManage>
    </div>
  )
}

export default ExtensionManageIndex
