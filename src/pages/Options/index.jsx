import React, { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { HashRouter } from "react-router-dom"

import "antd/dist/reset.css"

import { message } from "antd"

import ".../utils/reset.css"
import "./index.css"

import { ExtensionChannelWorker } from ".../pages/Options/management/worker/ExtensionChannelWorker"
import { storage } from ".../storage/sync"
import { isEdgePackage, isEdgeRuntime } from ".../utils/channelHelper"
import { ExtensionIconBuilder } from "../Background/extension/ExtensionIconBuilder"
import Options from "./Options"
import { checkLatestVersion } from "./utils/LatestVersionChecker"

const storageViewApi = storage.helper.view.getApi()
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
ExtensionChannelWorker.build()
checkLatestVersion()

console.log(`Package: ${isEdgePackage() ? "Edge" : "Chrome"}`)
console.log(`Runtime: ${isEdgeRuntime() ? "Edge" : "Chrome"}`)
