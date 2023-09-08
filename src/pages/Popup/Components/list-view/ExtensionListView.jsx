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

  const [items1, items2] = usePopupExtensions(extensions, options)
  useEffect(() => {
    setItems(items1.concat(items2))
  }, [items1, items2])

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
