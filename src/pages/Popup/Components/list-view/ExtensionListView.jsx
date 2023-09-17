import React, { memo, useEffect, useState } from "react"

import classNames from "classnames"
import { styled } from "styled-components"

import { usePopupExtensions } from "../../utils/usePopupExtensions"
import ExtensionListItem from "./ExtensionListItem"

/**
 * 普通扩展的列表展示
 */
const ExtensionList = memo(({ extensions, options }) => {
  const [items, setItems] = useState([])

  const [items0, items1, items2] = usePopupExtensions(extensions, options)
  useEffect(() => {
    items0.forEach((i) => (i.__top__ = true))
    setItems(items0.concat(items1, items2))
  }, [items0, items1, items2])

  return (
    <Style>
      {items.map((item) => {
        return (
          <li key={item.id}>
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
