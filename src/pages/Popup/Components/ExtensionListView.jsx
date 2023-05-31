import classNames from "classnames"
import _ from "lodash"
import React, { useEffect, useState } from "react"

import ExtensionListItem from "./ExtensionListItem"
import "./ExtensionListView.css"

function ExtensionList({ extensions }) {
  const items = _.orderBy(
    extensions.filter((i) => i.type === "extension"),
    ["enabled", "shortName"],
    ["desc", "asc"]
  )

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
