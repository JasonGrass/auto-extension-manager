import React, { memo, useCallback, useMemo, useState } from "react"

import { styled } from "styled-components"

import { usePopupExtensions } from "../../utils/usePopupExtensions"
import ExtensionListItem from "./ExtensionListItem"

/**
 * 普通扩展的列表展示
 */
const ExtensionList = memo(({ extensions, options }) => {
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

  const showItems = useMemo(() => items.top.concat(items.enabled, items.disabled), [items])

  return (
    <Style>
      {showItems.map((item, index) => {
        return (
          <li key={item.id}>
            <ExtensionListItem
              item={item}
              isTop={index < items.top.length}
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
