import React, { memo, useCallback, useEffect, useState } from "react"

import { styled } from "styled-components"

import { usePopupExtensions } from "../../utils/usePopupExtensions"
import ExtensionListItem from "./ExtensionListItem"

/**
 * 普通扩展的列表展示
 */
const ExtensionList = memo(({ extensions, options }) => {
  const [showItems, setItems] = useState([])
  const [moved, setMoved] = useState("") // Trigger usePopupExtensions to rebuild after enable state changes.

  const [items] = usePopupExtensions(extensions, options, moved)

  const onItemEnableChanged = useCallback(
    (item) => {
      if (options.setting.isRefreshAfterEnableDisable ?? true) {
        setMoved(Date.now().toString())
      }
    },
    [options]
  )

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
            <ExtensionListItem
              item={item}
              options={options}
              onItemEnableChanged={onItemEnableChanged}></ExtensionListItem>
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
