import React, { useEffect, useState } from "react"
import { Outlet } from "react-router-dom"

import { getLang } from "../../../utils/utils.js"
import Title from "../Title.jsx"

const ExtensionManageIndex = () => {
  return (
    <div>
      <Title title={getLang("management_title")}></Title>
      <Outlet />
    </div>
  )
}

export default ExtensionManageIndex
