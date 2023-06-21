import React, { memo } from "react"

import { message } from "antd"
import classNames from "classnames"

import { getIcon } from "../../../utils/extensionHelper"
import { AppListStyle } from "./AppListStyle.js"

/**
 * APP 应用类型的扩展
 */
const AppList = memo(({ items }) => {
  if (!items || items.length === 0) return null

  const onIconClick = (e, item) => {
    if (item.enabled) {
      chrome.management.launchApp(item.id)
    } else {
      message.info(`${item.shortName} 未启用`)
    }
  }

  return (
    <AppListStyle>
      <ul>
        {items.map((item) => {
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
})

export default AppList
