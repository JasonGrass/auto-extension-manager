import React, { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { HashRouter } from "react-router-dom"

import "antd/dist/reset.css"

import { message } from "antd"

import ".../utils/reset.css"
import "./index.css"

import { OptionStorageViewProvider } from ".../storage/options-storage"
import { isEdgePackage, isEdgeRuntime } from ".../utils/channelHelper"
import { ExtensionIconBuilder } from "../Background/extension/ExtensionIconBuilder"
import Options from "./Options"

const storageViewApi = OptionStorageViewProvider.getApi()
storageViewApi.message = message

const container = document.getElementById("app-container")
const root = createRoot(container)
root.render(
  <StrictMode>
    <HashRouter>
      <Options />
    </HashRouter>
  </StrictMode>
)

ExtensionIconBuilder.build()

console.log(`Package: ${isEdgePackage() ? "Edge" : "Chrome"}`)
console.log(`Runtime: ${isEdgeRuntime() ? "Edge" : "Chrome"}`)
