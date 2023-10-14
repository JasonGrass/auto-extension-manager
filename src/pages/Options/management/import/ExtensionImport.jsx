import React, { memo, useEffect, useRef, useState } from "react"

import { Button, Checkbox, Radio, Steps } from "antd"
import styled from "styled-components"

import { useInit } from "../hooks/useInit"
import { buildRecords } from "../utils"
import ImportHandler from "./ImportHandler"
import ImportTarget from "./ImportTarget"


const ExtensionImport = memo(() => {
  const [extensions, options] = useInit()
  const [currentStep, setCurrentStep] = useState(1)

  const [records, setRecords] = useState([])

  useEffect(() => {
    if (!options) {
      return
    }

    setRecords(buildRecords(extensions, options.management))
  }, [extensions, options])

  if (!options) {
    return null
  }

  return (
    <Style>
      <h1>导入扩展</h1>

      <div className="ext-import-steps">
        <Steps
          current={currentStep}
          items={[
            {
              title: "来源",
              description: "导入文件/粘贴文本"
            },
            {
              title: "导入",
              description: "安装扩展"
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

      <div className="ext-import-step-content">
        {currentStep === 0 && <ImportTarget></ImportTarget>}

        {currentStep === 1 && (
          <ImportHandler extensions={records} options={options}></ImportHandler>
        )}
      </div>

      {currentStep >= 0 && currentStep < 1 && (
        <Button className="ext-share-step-btn" onClick={() => setCurrentStep(currentStep + 1)}>
          下一步
        </Button>
      )}
    </Style>
  )
})

export default ExtensionImport

const Style = styled.div`
  padding-bottom: 24px;

  .ext-import-steps {
    margin: 24px 48px 24px 0;
  }

  .ext-import-step-content {
    margin: 12px 48px 12px 0;
    padding: 12px;
    border: 1px solid #e8e8e8;
    border-radius: 4px;
  }
`
