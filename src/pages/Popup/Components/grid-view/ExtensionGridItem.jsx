import React, { memo, useEffect, useRef, useState } from "react"

import {
  DeleteOutlined,
  HomeOutlined,
  LockOutlined,
  SettingOutlined,
  UnlockOutlined
} from "@ant-design/icons"
import { Popconfirm, Space, message } from "antd"
import classNames from "classnames"

import { ManualEnableCounter } from ".../storage/local/ManualEnableCounter"
import { getIcon } from ".../utils/extensionHelper.js"
import { getLang } from ".../utils/utils"
import { isStringEmpty } from ".../utils/utils.js"
import { useExtensionItemPin } from "../../hooks/useExtensionItemPin"
import { ExtensionGridItemStyle } from "./ExtensionGridItemStyle"

const manualEnableCounter = new ManualEnableCounter()

const ExtensionGridItem = memo(({ item, options }) => {
  // 扩展存在设置页面
  const existOptionPage = !isStringEmpty(item.optionsUrl)
  // 扩展存在 Home 页面
  const existHomePage = !isStringEmpty(item.homepageUrl)

  // 扩展是否可用
  const [itemEnable, setItemEnable] = useState(item.enabled)
  // 扩展是否在固定分组中
  const [itemPined, setItemPined] = useExtensionItemPin(item, options)

  useEffect(() => {
    setItemEnable(item.enabled)
  }, [item])

  // 交互状态：鼠标是否 hover
  const [isMouseEnter, setIsMouseEnter] = useState(false)
  // UI 状态：菜单显示的位置
  const [isMenuOnRight, setIsMenuOnRight] = useState(true)

  // 是否显示 APP 名称
  const isShowAppNameInGirdView = options.setting.isShowAppNameInGirdView ?? false
  // 禁用扩展使用灰色
  const grayStyleOfDisable = options.setting.isGaryStyleOfDisableInGridView ?? false
  // 固定分组扩展的小圆点
  const isShowDotOfFixedExtension = options.setting.isShowDotOfFixedExtension ?? true

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
      message.info(`${getLang("disable_extension")} ${item.name}`)
    } else {
      chrome.management.setEnabled(item.id, true)
      setItemEnable(true)
      message.info(`${getLang("enable_extension")} ${item.name}`)
      manualEnableCounter.count(item.id)
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
          className={classNames([
            "grid-display-item-box",
            { "grid-item-disable": !itemEnable && grayStyleOfDisable }
          ])}>
          <img src={getIcon(item, 48)} alt="icon" />
          {isShowAppNameInGirdView && (
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
            "menu-on": isMouseEnter,
            "operation-menu-disable": !itemEnable
          }
        ])}
        ref={menuRef}>
        <h3 className="operation-menu-title">{item.name}</h3>
        <div className="operation-menu-items">
          <Space className="operation-menu-item" onClick={(e) => handlePinButtonClick(e, item)}>
            {itemPined ? <LockOutlined /> : <UnlockOutlined />}
          </Space>

          <Space
            className={classNames({
              "operation-menu-item-disabled": !existOptionPage,
              "operation-menu-item": existOptionPage
            })}
            onClick={(e) => handleSettingButtonClick(e, item)}>
            <SettingOutlined />
          </Space>

          <Popconfirm
            title={getLang("remove_extension")}
            description={getLang("remove_extension_confirm", item.shortName)}
            onConfirm={(e) => confirmDeleteExtension(e, item)}
            okText="Yes"
            cancelText="Cancel">
            <Space className="operation-menu-item">
              <DeleteOutlined />
            </Space>
          </Popconfirm>

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
