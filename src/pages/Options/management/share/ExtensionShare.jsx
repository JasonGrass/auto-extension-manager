import React, { memo, useEffect, useRef, useState } from "react"

import { Button, Checkbox, Radio, Steps } from "antd"
import styled from "styled-components"

import { useInit } from "../hooks/useInit"
import ShareContent from "./ShareContent"
import ShareMode from "./ShareMode"
import ShareTarget from "./ShareTarget"

const ExtensionShare = memo(() => {
  const [extensions, options] = useInit()

  const [currentStep, setCurrentStep] = useState(2)

  if (!options) {
    return null
  }

  return (
    //  TODO lang

    <Style>
      <h1>导出或分享你的扩展</h1>
      <div className="ext-share-steps">
        <Steps
          current={currentStep}
          items={[
            {
              title: "目标",
              description: "选择分享/导出的扩展"
            },
            {
              title: "内容",
              description: "选择导出的自定义内容"
            },
            {
              title: "导出方式",
              description: "设置导出方式"
            }
          ]}
        />
      </div>

      <Button
        className="ext-share-step-btn"
        disabled={currentStep <= 0}
        onClick={() => setCurrentStep(currentStep - 1)}>
        上一步
      </Button>

      <div className="ext-share-step-content">
        {currentStep === 0 && <ShareTarget extensions={extensions} options={options}></ShareTarget>}

        {currentStep === 1 && <ShareContent></ShareContent>}

        {currentStep === 2 && <ShareMode extensions={extensions} options={options}></ShareMode>}
      </div>

      {currentStep >= 0 && currentStep <= 1 && (
        <Button className="ext-share-step-btn" onClick={() => setCurrentStep(currentStep + 1)}>
          下一步
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
