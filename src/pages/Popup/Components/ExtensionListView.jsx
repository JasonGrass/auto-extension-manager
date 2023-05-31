import classNames from "classnames"
import _ from "lodash"
import React, { useEffect, useState } from "react"

import ExtensionListItem from "./ExtensionListItem"
import "./ExtensionListView.css"

function ExtensionList({ extensions }) {
  const items = extensions
    .filter((i) => i.type === "extension")
    .sort((a, b) => {
      if (a.enabled === b.enabled) {
        return a.name.localeCompare(b.name) // Sort by name
      }
      return a.enabled < b.enabled ? 1 : -1 // Sort by state
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
            <ExtensionListItem item={item}></ExtensionListItem>
          </li>
        )
      })}
    </ul>
  )
}

export default ExtensionList
