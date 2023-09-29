import React, { memo } from "react"

import { message } from "antd"
import classNames from "classnames"
import chromeP from "webext-polyfill-kinda"

import { getLang } from ".../utils/utils"
import { getIcon } from "../../../utils/extensionHelper"
import { AppListStyle } from "./AppListStyle.js"

/**
 * APP 应用类型的扩展
 */
const AppList = memo(({ items }) => {
  const [messageApi, contextHolder] = message.useMessage()

  if (!items || items.length === 0) return null

  const onIconClick = async (e, item) => {
    if (item.enabled) {
      try {
        await chromeP.management.launchApp(item.id)
      } catch (err) {
        console.error(err)
        messageApi.warning(err.message)
        if (err.message.indexOf("is deprecated") > -1) {
          messageApi.info("use `chrome://apps` for more info")
        }
      }
    } else {
      messageApi.info(`${item.shortName} ${getLang("app_not_enable")}`)
    }
  }

  return (
    <AppListStyle>
      {contextHolder}
      <ul>
        {items.map((item) => {
          return (
            <li
              key={item.id}
              className={classNames({
                "ext-item": true,
                "not-enable": !item.enabled
              })}>
              <img src={getIcon(item, 48)} alt="" onClick={(e) => onIconClick(e, item)} />
              <span>{item.shortName}</span>
            </li>
          )
        })}

        {new Array(10).fill("").map((_, index) => (
          <i key={index}></i>
        ))}
      </ul>
    </AppListStyle>
  )
})

export default AppList
