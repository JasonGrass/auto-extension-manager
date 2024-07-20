import React, { memo, useEffect, useRef, useState } from "react"

import {
  DeleteOutlined,
  HomeOutlined,
  LockOutlined,
  SettingOutlined,
  ToolOutlined,
  UnlockOutlined
} from "@ant-design/icons"
import { Popconfirm, Space, message } from "antd"
import classNames from "classnames"

import { SortableList } from ".../pages/Options/components/SortableList"
import { ManualEnableCounter } from ".../storage/local/ManualEnableCounter"
import { isDevRuntime } from ".../utils/channelHelper"
import { getHomepageUrl, getIcon, getOriginSettingUrl } from ".../utils/extensionHelper.js"
import { getLang } from ".../utils/utils"
import { isStringEmpty } from ".../utils/utils.js"
import { useExtensionItemPin } from "../../hooks/useExtensionItemPin"
import { ExtensionGridItemStyle } from "./ExtensionGridItemStyle"

const manualEnableCounter = new ManualEnableCounter()

const ExtensionGridItem = memo(({ item, options, enabled, onItemMove }) => {
  const [messageApi, contextHolder] = message.useMessage()

  // 扩展存在设置页面
  const existOptionPage = !isStringEmpty(item.optionsUrl)
  // 扩展存在 Home 页面
  const existHomePage = !isStringEmpty(item.homepageUrl)

  // 扩展是否可用
  const [itemEnable, setItemEnable] = useState(enabled ?? item.enabled)
  // 扩展是否在固定分组中
  const [itemPined, setItemPined] = useExtensionItemPin(item, options)

  // 是否启用了切换分组时，执行启用/禁用扩展的操作。如果没有打开这个功能，则没必要显示锁的标记
  const canLock = options.setting.isRaiseEnableWhenSwitchGroup ?? false

  useEffect(() => {
    setItemEnable(item.enabled)
  }, [item, enabled])

  // 交互状态：鼠标是否 hover
  const [isMouseEnter, setIsMouseEnter] = useState(false)
  // 交互状态：鼠标右键是否点击
  const [isMouseRightClick, setIsMouseRightClick] = useState(false)
  // 交互状态：菜单是否显示
  const [isMenuShow, setIsMenuShow] = useState(false)
  // UI 状态：菜单显示的位置
  const [isMenuOnRight, setIsMenuOnRight] = useState(true)

  // 是否显示 APP 名称
  const isShowAppNameInGirdView = options.setting.isShowAppNameInGirdView ?? false
  // 禁用扩展使用灰色
  const grayStyleOfDisable = options.setting.isGaryStyleOfDisableInGridView ?? false
  // 固定分组扩展的小圆点
  const isShowDotOfFixedExtension = options.setting.isShowDotOfFixedExtension ?? true
  // 菜单显示的方式，false: hover 显示，true: 鼠标右键点击显示
  const menuDisplayByRightClick = options.setting.isMenuDisplayByRightClick ?? false

  const containerRef = useRef(null)
  const menuRef = useRef(null)

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
  }, [isMouseEnter, isMouseRightClick])

  const handleItemMouseEnter = () => {
    setIsMouseEnter(true)
  }

  const handleItemMouseLeave = () => {
    setTimeout(() => {
      setIsMouseEnter(false)
      setIsMouseRightClick(false)
    }, 60) // 鼠标从 item 移动到 menu 上，需要一点时间
  }

  const handleMenuMouseEnter = () => {
    setIsMenuShow(true)
  }

  const handleMenuMouseLeave = () => {
    setIsMenuShow(false)
    setIsMouseRightClick(false)
  }

  const handleItemMouseClick = (e) => {
    if (e.button === 2) {
      setIsMouseRightClick(true)
    }
  }

  const handleContextMenu = (e) => {
    // 在扩展 Item 上，禁用默认的右键菜单，其它地方不禁用
    e.preventDefault()
  }

  useEffect(() => {
    const el = containerRef.current
    if (el) {
      el.addEventListener("contextmenu", handleContextMenu)
      return () => {
        el.removeEventListener("contextmenu", handleContextMenu)
      }
    }
  }, [])

  /**
   * 打开扩展设置页面
   */
  const handleSettingButtonClick = (e, item) => {
    if (existOptionPage) {
      if (!item.enabled) {
        messageApi.info(getLang("extension_not_enable"))
        return
      }
      chrome.tabs.create({ url: item.optionsUrl })
    }
  }

  /**
   * 打开扩展主页
   */
  const handleHomeButtonClick = (e, item) => {
    const url = getHomepageUrl(item, options.setting.isHomeLinkToStore)
    if (url) {
      chrome.tabs.create({ url })
    }
  }

  /**
   * 打开浏览器自带的扩展设置页面
   */
  const handleOriginSettingButtonClick = (e, item) => {
    const url = getOriginSettingUrl(item)
    if (url) {
      chrome.tabs.create({ url })
    }
  }

  /**
   * 删除扩展
   */
  const confirmDeleteExtension = (e, item) => {
    chrome.management.uninstall(item.id)
    setIsMouseEnter(false)
  }

  /**
   * 固定/解除固定扩展（是否放在固定分组中）
   */
  const handlePinButtonClick = (e, item) => {
    setItemPined(!itemPined)
  }

  const onItemClick = () => {
    if (itemEnable) {
      chrome.management.setEnabled(item.id, false)
      setItemEnable(false)
      item.enabled = false
      onItemMove?.(item)
      messageApi.info(`${getLang("disable_extension")} ${item.name}`)
    } else {
      chrome.management.setEnabled(item.id, true)
      setItemEnable(true)
      item.enabled = true
      onItemMove?.(item)
      messageApi.info(`${getLang("enable_extension")} ${item.name}`)
      manualEnableCounter.count(item.id)
    }
  }

  return (
    <ExtensionGridItemStyle
      ref={containerRef}
      onMouseEnter={handleItemMouseEnter}
      onMouseLeave={handleItemMouseLeave}
      onMouseUpCapture={handleItemMouseClick}
      animation_delay={menuDisplayByRightClick ? 0 : 0.3}>
      {contextHolder}
      {/* 扩展显示 */}
      <div
        className={classNames([
          "grid-display-item",
          { "grid-display-item-scale": isMouseEnter || isMenuShow }
        ])}
        onClick={onItemClick}>
        <div
          className={classNames([
            "grid-display-item-box",
            { "grid-item-disable": !itemEnable && grayStyleOfDisable }
          ])}>
          <img src={getIcon(item, 128)} alt="icon" />

          {/* 扩展名，如果 hover 则隐藏，以显示拖拽图标 */}
          {isShowAppNameInGirdView && !isMouseEnter && (
            <span
              className={classNames([
                "grid-display-item-title",
                {
                  "grid-display-item-title-gray": !itemEnable
                }
              ])}>
              {getExtItemDisplayName(item)}
            </span>
          )}

          {/* 拖拽的抓手图标 */}
          {isMouseEnter && (
            <div
              className={classNames({
                "drag-icon-with-name-show": isShowAppNameInGirdView,
                "drag-icon-without-name-show": !isShowAppNameInGirdView
              })}>
              <SortableList.DragHandle>
                <svg
                  t="1709625820769"
                  className="drag-icon-svg"
                  viewBox="0 0 1024 1024"
                  version="1.1"
                  xmlns="http://www.w3.org/2000/svg"
                  p-id="1485">
                  <path
                    d="M330.666667 640a74.666667 74.666667 0 1 1-149.333334 0 74.666667 74.666667 0 0 1 149.333334 0z m0-256a74.666667 74.666667 0 1 1-149.333334 0 74.666667 74.666667 0 0 1 149.333334 0z m256 256a74.666667 74.666667 0 1 1-149.333334 0 74.666667 74.666667 0 0 1 149.333334 0z m0-256a74.666667 74.666667 0 1 1-149.333334 0 74.666667 74.666667 0 0 1 149.333334 0z m256 256a74.666667 74.666667 0 1 1-149.333334 0 74.666667 74.666667 0 0 1 149.333334 0z m0-256a74.666667 74.666667 0 1 1-149.333334 0 74.666667 74.666667 0 0 1 149.333334 0z"
                    p-id="1486"></path>
                </svg>
              </SortableList.DragHandle>
            </div>
          )}
        </div>
        {itemPined && isShowDotOfFixedExtension && <i className="item-pined-dot"></i>}
      </div>

      {/* hover 菜单 */}
      <div
        className={classNames([
          "operation-menu",
          {
            "menu-right": isMenuOnRight,
            "menu-left": !isMenuOnRight,
            "menu-on": (menuDisplayByRightClick ? isMouseRightClick : isMouseEnter) || isMenuShow,
            "operation-menu-disable": !itemEnable
          }
        ])}
        onMouseEnter={handleMenuMouseEnter}
        onMouseLeave={handleMenuMouseLeave}
        ref={menuRef}>
        <h3 className="operation-menu-title">{item.name}</h3>
        <div className="operation-menu-items">
          {canLock && (
            <Space className="operation-menu-item" onClick={(e) => handlePinButtonClick(e, item)}>
              {itemPined ? <LockOutlined /> : <UnlockOutlined />}
            </Space>
          )}
          <Space
            className={classNames({
              "operation-menu-item-disabled": !existOptionPage,
              "operation-menu-item": existOptionPage
            })}
            onClick={(e) => handleSettingButtonClick(e, item)}>
            <SettingOutlined />
          </Space>
          {/* <Popconfirm
            title={getLang("remove_extension")}
            description={getLang("remove_extension_confirm", item.shortName)}
            onConfirm={(e) => confirmDeleteExtension(e, item)}
            okText="Yes"
            cancelText="Cancel">
            <Space className="operation-menu-item">
              <DeleteOutlined />
            </Space>
          </Popconfirm> */}
          <Space className="operation-menu-item" onClick={(e) => confirmDeleteExtension(e, item)}>
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
          <Space
            className="operation-menu-item"
            onClick={(e) => handleOriginSettingButtonClick(e, item)}>
            <ToolOutlined />
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
