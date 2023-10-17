import React, { memo, useEffect, useRef, useState } from "react"

import { Button, Checkbox, Radio, Steps, message } from "antd"
import styled from "styled-components"

import { getLang } from ".../utils/utils"
import { useInit } from "../hooks/useInit"
import ShareContent from "./ShareContent"
import ShareMode from "./ShareMode"
import ShareTarget from "./ShareTarget"

const ExtensionShare = memo(() => {
  const [messageApi, contextHolder] = message.useMessage()

  const [extensions, options] = useInit()

  const [currentStep, setCurrentStep] = useState(0)

  const [targetExtensionIds, setTargetExtensionIds] = useState([])
  const [targetConfig, setTargetConfig] = useState(null)
  const [exportRange, setExportRange] = useState(["alias", "remark"])

  const targetRef = useRef()
  const contentRef = useRef()

  const onNext = () => {
    if (currentStep === 0) {
      try {
        const selected = targetRef.current.getTarget()
        const config = targetRef.current.getConfig()
        setTargetExtensionIds(selected.extensionIds)
        setTargetConfig(config)
      } catch (error) {
        messageApi.warning(error.message)
        return
      }
    }

    if (currentStep === 1) {
      setExportRange(contentRef.current.getContent())
    }

    setCurrentStep(currentStep + 1)
  }

  if (!options) {
    return null
  }

  return (
    <Style>
      {contextHolder}
      <h1>{getLang("management_export_share_your_extension")}</h1>
      <div className="ext-share-steps">
        <Steps
          current={currentStep}
          items={[
            {
              title: getLang("management_export_target"),
              description: getLang("management_export_target_desc")
            },
            {
              title: getLang("management_export_content"),
              description: getLang("management_export_content_desc")
            },
            {
              title: getLang("management_export_type"),
              description: getLang("management_export_type_desc")
            }
          ]}
        />
      </div>

      <Button
        className="ext-share-step-btn"
        disabled={currentStep <= 0}
        onClick={() => setCurrentStep(currentStep - 1)}>
        {getLang("management_prev_step")}
      </Button>

      <div className="ext-share-step-content">
        {currentStep === 0 && (
          <ShareTarget
            ref={targetRef}
            config={targetConfig}
            extensions={extensions}
            options={options}></ShareTarget>
        )}

        {currentStep === 1 && (
          <ShareContent
            ref={contentRef}
            config={{
              exportRange
            }}></ShareContent>
        )}

        {currentStep === 2 && (
          <ShareMode
            targetExtensionIds={targetExtensionIds}
            exportRange={exportRange}
            extensions={extensions}
            options={options}></ShareMode>
        )}
      </div>

      {currentStep >= 0 && currentStep <= 1 && (
        <Button className="ext-share-step-btn" onClick={onNext}>
          {getLang("management_next_step")}
        </Button>
      )}
    </Style>
  )
})

export default ExtensionShare

const Style = styled.div`
  padding-bottom: 24px;

  .ext-share-steps {
    margin: 24px 48px 24px 0;
  }

  .ext-share-step-content {
    margin: 12px 48px 12px 0;
    padding: 12px;
    border: 1px solid #e8e8e8;
    border-radius: 4px;
  }
`
