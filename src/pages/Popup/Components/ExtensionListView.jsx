import React, { memo } from "react"

import classNames from "classnames"

import "./ExtensionListView.css"

import { sortExtension } from ".../utils/extensionHelper"
import ExtensionListItem from "./ExtensionListItem"

/**
 * 普通扩展的列表展示
 */
const ExtensionList = memo(({ extensions, options }) => {
  const items = sortExtension(extensions)

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
            <ExtensionListItem
              item={item}
              options={options}></ExtensionListItem>
          </li>
        )
      })}
    </ul>
  )
})

export default ExtensionList
