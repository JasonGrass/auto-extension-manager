import React, { memo, useEffect, useRef, useState } from "react"

import { DeleteOutlined, HomeOutlined, PushpinOutlined, SettingOutlined } from "@ant-design/icons"
import { Space } from "antd"
import classNames from "classnames"

import { getIcon } from ".../utils/extensionHelper.js"
import { isStringEmpty } from ".../utils/utils.js"
import { ExtensionGridItemStyle } from "./ExtensionGridItemStyle"

const ExtensionGridItem = memo(({ item, options }) => {
  // 扩展存在设置页面
  const existOptionPage = !isStringEmpty(item.optionsUrl)
  // 扩展存在 Home 页面
  const existHomePage = !isStringEmpty(item.homepageUrl)

  // 扩展是否可用
  const [itemEnable, setItemEnable] = useState(item.enabled)
  // 扩展是否在固定分组中
  const [itemPined, setItemPined] = useState(false)

  // 交互状态：鼠标是否 hover
  const [isMouseEnter, setIsMouseEnter] = useState(false)
  // UI 状态：菜单显示的位置
  const [isMenuOnRight, setIsMenuOnRight] = useState(true)

  const containerRef = useRef(null)
  const menuRef = useRef(null)

  useEffect(() => {
    const fixExts = options.groups.find((g) => g.id === "fixed")?.extensions
    if (!fixExts) {
      return
    }

    setItemPined(fixExts.includes(item.id))
  }, [item, options])

  const checkMenuPosition = () => {
    const containerRect = containerRef.current.getBoundingClientRect()
    const menuRect = menuRef.current.getBoundingClientRect()
    const rightSpace = window.innerWidth - containerRect.right

    if (rightSpace < menuRect.width) {
      setIsMenuOnRight(false)
    } else {
      setIsMenuOnRight(true)
    }
  }

  useEffect(() => {
    checkMenuPosition()
  }, [isMouseEnter])

  const handleMouseEnter = () => {
    setIsMouseEnter(true)
  }

  const handleMouseLeave = () => {
    setIsMouseEnter(false)
  }

  /**
   * 打开扩展设置页面
   */
  const handleSettingButtonClick = (e, item) => {
    if (existOptionPage) {
      chrome.tabs.create({ url: item.optionsUrl })
    }
  }

  /**
   * 打开扩展主页
   */
  const handleHomeButtonClick = (e, item) => {
    if (existHomePage) {
      chrome.tabs.create({ url: item.homepageUrl })
    }
  }

  /**
   * 删除扩展
   */
  const handleDeleteButtonClick = (e, item) => {
    chrome.management.uninstall(item.id)
    setIsMouseEnter(false)
  }

  /**
   * 固定/解除固定扩展（是否放在固定分组中）
   */
  const handlePinButtonClick = (e, item) => {}

  const onItemClick = () => {
    if (itemEnable) {
      chrome.management.setEnabled(item.id, false)
      setItemEnable(false)
    } else {
      chrome.management.setEnabled(item.id, true)
      setItemEnable(true)
    }
  }

  return (
    <ExtensionGridItemStyle
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}>
      {/* 扩展显示 */}
      <div className={classNames(["grid-display-item"])} onClick={onItemClick}>
        <div
          className={classNames(["grid-display-item-box", { "grid-item-disable": !itemEnable }])}>
          <img src={getIcon(item, 48)} alt="icon" />
          <span className="grid-display-item-title">{getExtItemDisplayName(item)}</span>
        </div>

        <i className={classNames(["item-pined-dot", { "item-pined-dot-hidden": !itemPined }])}></i>
      </div>

      {/* hover 菜单 */}
      <div
        className={classNames([
          "operation-menu",
          {
            "menu-right": isMenuOnRight,
            "menu-left": !isMenuOnRight,
            "menu-on": isMouseEnter
          }
        ])}
        ref={menuRef}>
        <h3 className="operation-menu-title">{item.name}</h3>
        <div className="operation-menu-items">
          <Space className="operation-menu-item" onClick={(e) => handlePinButtonClick(e, item)}>
            <PushpinOutlined />
          </Space>

          <Space
            className={classNames({
              "operation-menu-item-disabled": !existOptionPage,
              "operation-menu-item": existOptionPage
            })}
            onClick={(e) => handleSettingButtonClick(e, item)}>
            <SettingOutlined />
          </Space>

          <Space className="operation-menu-item" onClick={(e) => handleDeleteButtonClick(e, item)}>
            <DeleteOutlined />
          </Space>

          <Space
            className={classNames({
              "operation-menu-item-disabled": !existHomePage,
              "operation-menu-item": existHomePage
            })}
            onClick={(e) => handleHomeButtonClick(e, item)}>
            <HomeOutlined />
          </Space>
        </div>
      </div>
    </ExtensionGridItemStyle>
  )
})

export default ExtensionGridItem

function getExtItemDisplayName(item) {
  try {
    if (item.__attach__?.alias) {
      return item.__attach__.alias
    }

    if (item.name.indexOf("-") > 0) {
      return item.name.split("-")[0].trim()
    }

    if (item.name.indexOf(":") > 0) {
      return item.name.split(":")[0].trim()
    }

    if (item.name.indexOf("：") > 0) {
      return item.name.split("：")[0].trim()
    }

    return item.name.trim()
  } catch (error) {
    console.error("尝试中扩展数据中获取短名称失败", item, error)
    return item.name
  }
}
