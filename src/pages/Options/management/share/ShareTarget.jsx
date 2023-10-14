import React, { memo, useEffect, useRef, useState } from "react"

import { Button, Checkbox, Radio, Segmented, Steps } from "antd"
import styled from "styled-components"

import ExtensionTarget from ".../pages/Options/components/ExtensionTarget"

const ShareTarget = memo(({ extensions, options }) => {
  const [targetRange, setTargetRange] = useState("all")
  const [selectedIds, setSelectedIds] = useState([])
  const targetRef = useRef()

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
            config={{}}
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
})

export default ShareTarget

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
