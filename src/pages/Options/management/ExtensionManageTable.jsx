import React, { Component, useCallback, useEffect, useRef, useState } from "react"

import { Button, Result } from "antd"

import analytics from ".../utils/googleAnalyze.js"
import { getLang } from ".../utils/utils"
import ExtensionManage from "./ExtensionManage.jsx"
import { useInit } from "./hooks/useInit.js"
import { MANAGEMENT_RENDER_TIMEOUT_MS, ManagementLoadError } from "./managementLoadPolicy"

const ExtensionManageTable = () => {
  const [extensions, options, initError] = useInit((exts, allOptions) => {
    analytics.fireEvent("alias_setting_open", {
      totalCount: allOptions.management.extensions.length
    })
  })
  const [renderError, setRenderError] = useState()
  const timeoutRef = useRef()
  const renderStartedAtRef = useRef(Date.now())
  const tableRenderedRef = useRef(false)

  const clearRenderTimeout = useCallback(() => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current)
      timeoutRef.current = undefined
    }
  }, [])

  useEffect(() => {
    timeoutRef.current = window.setTimeout(() => {
      const timeoutError = new ManagementLoadError(
        "TABLE_RENDER_TIMEOUT",
        `Extension management table was not rendered within ${MANAGEMENT_RENDER_TIMEOUT_MS}ms`
      )
      console.error("[ExtensionManagement] Table rendering timed out", timeoutError)
      setRenderError(timeoutError)
    }, MANAGEMENT_RENDER_TIMEOUT_MS)

    return clearRenderTimeout
  }, [clearRenderTimeout])

  useEffect(() => {
    if (initError) {
      clearRenderTimeout()
    }
  }, [clearRenderTimeout, initError])

  const handleTableRendered = useCallback(() => {
    if (tableRenderedRef.current) {
      return
    }
    tableRenderedRef.current = true
    clearRenderTimeout()
    console.info("[ExtensionManagement] Table rendered", {
      durationMs: Date.now() - renderStartedAtRef.current,
      extensionCount: extensions.length
    })
  }, [clearRenderTimeout, extensions.length])

  const handleTableError = useCallback(
    (error) => {
      clearRenderTimeout()
      console.error("[ExtensionManagement] Table preparation failed", error)
      setRenderError(error)
    },
    [clearRenderTimeout]
  )

  const error = initError ?? renderError
  if (error) {
    return <ManagementErrorView error={error} />
  }

  if (!options) {
    return null
  }

  return (
    <ManagementErrorBoundary>
      <ExtensionManage
        extensions={extensions}
        options={options}
        onTableRendered={handleTableRendered}
        onTableError={handleTableError}></ExtensionManage>
    </ManagementErrorBoundary>
  )
}

const ManagementErrorView = ({ error }) => {
  const errorCode = error?.code ?? error?.name ?? "UNKNOWN_ERROR"
  return (
    <Result
      status="error"
      title={getLang("management_load_error_title")}
      subTitle={`${getLang("management_load_error_description")} (${errorCode})`}
      extra={
        <Button type="primary" onClick={() => window.location.reload()}>
          {getLang("management_reload")}
        </Button>
      }
    />
  )
}

class ManagementErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: undefined }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error("[ExtensionManagement] Table render crashed", error, info)
  }

  render() {
    if (this.state.error) {
      return <ManagementErrorView error={this.state.error} />
    }
    return this.props.children
  }
}

export default ExtensionManageTable
