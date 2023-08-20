import React, { memo, useEffect, useState } from "react"

import classNames from "classnames"
import { styled } from "styled-components"

import { appendAdditionInfo, sortExtension } from ".../utils/extensionHelper"
import ExtensionListItem from "./ExtensionListItem"

/**
 * 普通扩展的列表展示
 */
const ExtensionList = memo(({ extensions, options }) => {
  const [items, setItems] = useState([])

  useEffect(() => {
    const list = appendAdditionInfo(extensions, options)
    setItems(sortExtension(list))
  }, [extensions, options])

  return (
    <Style>
      {items.map((item) => {
        return (
          <li
            key={item.id}
            className={classNames({
              "is-enable": item.enabled,
              "not-enable": !item.enabled
            })}>
            <ExtensionListItem item={item} options={options}></ExtensionListItem>
          </li>
        )
      })}
    </Style>
  )
})

export default ExtensionList

const Style = styled.ul`
  li {
    /* border: 1px solid #cccccc55; */
    margin-bottom: 1px;
  }

  li:last-child {
    border-bottom: none;
  }
`
