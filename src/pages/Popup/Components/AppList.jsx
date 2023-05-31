import React from "react"

import { message } from "antd"
import classNames from "classnames"
import _ from "lodash"

import { getIcon } from "../../../utils/extensionHelper"
import { AppListStyle } from "./AppListStyle.js"

function AppList({ items }) {
  const appTypes = ["hosted_app", "packaged_app", "legacy_packaged_app"]
  const apps = items.filter((i) => appTypes.indexOf(i.type) >= 0)

  const onIconClick = (e, item) => {
    // console.log(item)

    if (item.enabled) {
      chrome.management.launchApp(item.id)
    } else {
      message.info(`${item.shortName} 未启用`)
    }
  }

  return (
    <AppListStyle>
      <h2>APP</h2>
      <ul>
        {apps.map((item) => {
          return (
            <li
              key={item.id}
              className={classNames({
                "ext-item": true,
                "not-enable": !item.enabled
              })}>
              <img
                src={getIcon(item, 32)}
                alt=""
                onClick={(e) => onIconClick(e, item)}
              />
              <span>{item.shortName}</span>
            </li>
          )
        })}
      </ul>
    </AppListStyle>
  )
}

export default AppList
