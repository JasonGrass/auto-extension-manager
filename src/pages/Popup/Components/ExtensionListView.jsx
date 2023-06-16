import React, { useEffect, useState } from "react"

import classNames from "classnames"
import _ from "lodash"

import "./ExtensionListView.css"

import {
  filterExtensions,
  isExtExtension,
  sortExtension
} from ".../utils/extensionHelper"
import ExtensionListItem from "./ExtensionListItem"

/**
 * 普通扩展的列表展示
 */
function ExtensionList({ extensions }) {
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
            <ExtensionListItem item={item}></ExtensionListItem>
          </li>
        )
      })}
    </ul>
  )
}

export default ExtensionList
