import React, { forwardRef, memo, useImperativeHandle, useRef, useState } from "react"

import styled from "styled-components"

import ExtensionTarget from ".../pages/Options/components/ExtensionTarget"
import { getLang } from ".../utils/utils"

const ExtensionSelector = ({ options, config, extensions }, ref) => {
  const emptyMessage = getLang("rule_set_target_no_any_target")
  const title = `2 ${getLang("rule_set_target_title")}`

  const selectorRef = useRef(null)

  // 搜索关键字
  const [searchText, setSearchText] = useState("")

  // 搜索扩展
  const onSearchTextChange = (e) => {
    const text = e.target.value
    setSearchText(text)
  }

  useImperativeHandle(ref, () => ({
    // 获取配置
    getExtensionSelectConfig: () => {
      return selectorRef.current.getExtensionSelectConfig()
    }
  }))

  return (
    <ExtensionTarget
      options={options}
      config={config}
      extensions={extensions}
      searchText={searchText}
      params={{ emptyMessage }}
      ref={selectorRef}>
      <div className="editor-step-header">
        <span className="title">{title}</span>
        <SearchStyle>
          <input
            type="text"
            placeholder="Search"
            value={searchText}
            onChange={(e) => onSearchTextChange(e)}></input>
        </SearchStyle>
      </div>
    </ExtensionTarget>
  )
}

export default memo(forwardRef(ExtensionSelector))

const SearchStyle = styled.div`
  position: absolute;
  top: -2px;
  left: 240px;

  padding-left: 36px;

  input {
    width: 200px;
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
