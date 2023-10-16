import React, { memo, useEffect, useRef, useState } from "react"

import { Button, Checkbox, Radio, Steps, message } from "antd"
import styled from "styled-components"

import { useInit } from "../hooks/useInit"
import { buildRecords } from "../utils"
import ImportHandler from "./ImportHandler"
import ImportTarget from "./ImportTarget"
import { parse } from "./helper/importParser"

const ExtensionImport = memo(() => {
  const [messageApi, contentHolder] = message.useMessage()
  const [extensions, options] = useInit()
  const [currentStep, setCurrentStep] = useState(0)

  // 本机已经安装的扩展记录
  const [records, setRecords] = useState([])
  // 解析之后的，导入的扩展信息
  const [inputs, setInputs] = useState([])
  // 输入的待解析文本内容
  const [inputText, setInputText] = useState("")
  const textRef = useRef(null)

  // 初始化
  useEffect(() => {
    if (!options) {
      return
    }

    setRecords(buildRecords(extensions, options.management))
  }, [extensions, options])

  // 下一步
  const onNext = () => {
    if (currentStep === 0) {
      const text = textRef.current.getValue()
      if (!text || text.trim() === "") {
        messageApi.warning("nothing input")
        return
      }
      setInputText(text)

      const result = parse(text)
      if (result) {
        setInputs(result)
      } else {
        messageApi.warning("cannot parse the input text")
        return
      }
    }
    setCurrentStep(currentStep + 1)
  }

  if (!options) {
    return null
  }

  return (
    <Style>
      {contentHolder}
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
        {currentStep === 0 && (
          <ImportTarget ref={textRef} config={{ value: inputText }}></ImportTarget>
        )}

        {currentStep === 1 && (
          <ImportHandler extensions={records} inputs={inputs} options={options}></ImportHandler>
        )}
      </div>

      {currentStep >= 0 && currentStep < 1 && (
        <Button className="ext-share-step-btn" onClick={onNext}>
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
