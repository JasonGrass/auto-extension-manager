import React, { forwardRef, memo, useEffect, useImperativeHandle, useRef, useState } from "react"

import { Button, Checkbox, Radio, Segmented, Steps } from "antd"
import styled from "styled-components"

import ExtensionTarget from ".../pages/Options/components/ExtensionTarget"

const ShareTarget = ({ extensions, options, config }, ref) => {
  const [targetRange, setTargetRange] = useState("all")
  const [partConfig, setPartConfig] = useState({})

  const targetRef = useRef()

  useImperativeHandle(ref, () => ({
    // 获取选择的目标扩展
    getTarget: () => {
      let extensionIds = []
      if (targetRange === "part") {
        const selected = targetRef.current.getExtensionSelectConfig()
        options.groups
          .filter((g) => selected.groups.includes(g.id))
          .forEach((g) => extensionIds.push(...g.extensions))
        extensionIds.push(...selected.extensions)
        extensionIds = Array.from(new Set(extensionIds))
      } else {
        extensionIds = extensions.map((ext) => ext.id)
      }

      return {
        extensionIds: extensionIds
      }
    },

    getConfig: () => {
      return {
        targetRange: targetRange,
        partConfig: targetRef.current.getExtensionSelectConfig()
      }
    }
  }))

  useEffect(() => {
    if (!config) {
      return
    }
    setTargetRange(config.targetRange)
    if (config.targetRange === "part") {
      setPartConfig({
        target: config.partConfig
      })
    }
  }, [config])

  // 搜索关键字
  const [searchText, setSearchText] = useState("")

  // 搜索扩展
  const onSearchTextChange = (e) => {
    const text = e.target.value
    setSearchText(text)
  }

  return (
    <Style>
      <Segmented
        value={targetRange}
        onChange={(v) => setTargetRange(v)}
        options={[
          { label: "全部扩展", value: "all" },
          { label: "部分扩展", value: "part" }
        ]}
      />

      {targetRange === "part" && (
        <div className="ext-select-target-wrapper">
          <ExtensionTarget
            ref={targetRef}
            extensions={extensions}
            options={options}
            searchText={searchText}
            config={partConfig}
            params={{
              emptyMessage: "没有选择任何扩展"
            }}>
            <SearchStyle>
              <input
                type="text"
                placeholder="Search"
                value={searchText}
                onChange={(e) => onSearchTextChange(e)}></input>
            </SearchStyle>
          </ExtensionTarget>
        </div>
      )}
    </Style>
  )
}

export default memo(forwardRef(ShareTarget))

const Style = styled.div`
  .ext-select-target-wrapper {
    margin-top: 12px;
  }
`

const SearchStyle = styled.div`
  input {
    width: 240px;
    height: 24px;

    outline-style: none;
    border: 1px solid #ccc;
    border-radius: 4px;

    &:focus {
      border-color: #66afe9;
      outline: 0;
      box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075), 0 0 4px rgba(102, 175, 233, 0.6);
    }
  }
`
