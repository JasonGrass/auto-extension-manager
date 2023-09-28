import React, { memo, useEffect, useState } from "react"

import classNames from "classnames"
import { styled } from "styled-components"

import { usePopupExtensions } from "../../utils/usePopupExtensions"
import ExtensionListItem from "./ExtensionListItem"

/**
 * 普通扩展的列表展示
 */
const ExtensionList = memo(({ extensions, options }) => {
  const [showItems, setItems] = useState([])

  const [items] = usePopupExtensions(extensions, options)

  useEffect(() => {
    const items0 = items.top
    const items1 = items.enabled
    const items2 = items.disabled

    items0.forEach((i) => (i.__top__ = true))
    const result = items0.concat(items1, items2)

    setItems(result)
  }, [items])

  return (
    <Style>
      {showItems.map((item) => {
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
