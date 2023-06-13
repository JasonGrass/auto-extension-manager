import React, { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { HashRouter } from "react-router-dom"

import "antd/dist/reset.css"

import ".../utils/reset.css"
import "./index.css"

import Options from "./Options"

const container = document.getElementById("app-container")
const root = createRoot(container)
root.render(
  <StrictMode>
    <HashRouter>
      <Options />
    </HashRouter>
  </StrictMode>
)
