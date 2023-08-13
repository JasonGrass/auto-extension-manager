import React, { memo, useEffect, useState } from "react"

import classNames from "classnames"

import "./ExtensionListView.css"

import { ManageOptions } from ".../storage"
import { appendAdditionInfo, sortExtension } from ".../utils/extensionHelper"
import ExtensionListItem from "./ExtensionListItem"

/**
 * 普通扩展的列表展示
 */
const ExtensionList = memo(({ extensions, options }) => {
  const [items, setItems] = useState([])

  useEffect(() => {
    ManageOptions.get().then((options) => {
      const list = appendAdditionInfo(extensions, options)
      setItems(sortExtension(list))
    })
  })

  return (
    <ul className="list-view">
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
    </ul>
  )
})

export default ExtensionList
