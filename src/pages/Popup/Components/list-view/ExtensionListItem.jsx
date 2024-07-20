import React, { memo, useEffect, useState } from "react"

import {
  DeleteOutlined,
  HomeOutlined,
  LockOutlined,
  SettingOutlined,
  ToolOutlined,
  UnlockOutlined
} from "@ant-design/icons"
import { Button, Popconfirm, Switch, message } from "antd"
import classNames from "classnames"

import "./ExtensionListItem.css"

import { ManualEnableCounter } from ".../storage/local/ManualEnableCounter"
import { getHomepageUrl, getIcon, getOriginSettingUrl } from ".../utils/extensionHelper.js"
import { getLang } from ".../utils/utils"
import { isStringEmpty } from ".../utils/utils.js"
import { useExtensionItemPin } from "../../hooks/useExtensionItemPin"

const manualEnableCounter = new ManualEnableCounter()

/**
 * 扩展列表项
 */
const ExtensionListItem = memo(({ item, enabled, options, onItemEnableChanged }) => {
  const [messageApi, contextHolder] = message.useMessage()

  const [isHover, setIsHover] = useState(false)
  const [isInteractive, setIsInteractive] = useState(false)
  const [isShowOperationButton, setIsShowOperationButton] = useState(false)

  const [itemEnable, setItemEnable] = useState(enabled ?? item.enabled)
  const existOptionPage = !isStringEmpty(item.optionsUrl)
  const existHomePage = !isStringEmpty(item.homepageUrl)

  // 是否在固定分组
  const [itemPined, setItemPined] = useExtensionItemPin(item, options)
  // 固定分组的小圆点
  const isShowDotOfFixedExtension = options.setting.isShowDotOfFixedExtension ?? true

  // 是否启用了切换分组时，执行启用/禁用扩展的操作。如果没有打开这个功能，则没必要显示锁的标记
  const canLock = options.setting.isRaiseEnableWhenSwitchGroup ?? false

  // 在切换分组可以控制扩展的开启或关闭时，这里需要主动更新 enabled，否则 UI 显示会有问题
  useEffect(() => {
    setItemEnable(item.enabled)
  }, [item, enabled])

  useEffect(() => {
    const showButtonAlways = options.setting?.isShowItemOperationAlways ?? false
    setIsShowOperationButton(showButtonAlways)
  }, [options])

  const onSwitchChange = async (checked, item) => {
    await chrome.management.setEnabled(item.id, checked)
    setItemEnable(checked)
    item.enabled = checked
    if (checked) {
      manualEnableCounter.count(item.id)
    }
    onItemEnableChanged?.(item)
  }

  // 扩展名称被点击，则执行扩展启用与禁用
  const onItemNameClick = () => {
    onSwitchChange(!item.enabled, item)
  }

  const onItemMouseOver = (e) => {
    if (e.type === "mouseenter") {
      setIsHover(true)
    } else if (e.type === "mouseleave" && !isInteractive) {
      setIsHover(false)
    }
  }

  const confirmDeleteExtension = (e, item) => {
    chrome.management.uninstall(item.id)
    setIsInteractive(false)
    setIsHover(false)
  }

  const cancelDeleteExtension = (e, item) => {
    setIsInteractive(false)
    setIsHover(false)
  }

  /**
   * 打开扩展设置页面
   */
  const handleSettingButtonClick = (e, item) => {
    if (!item.enabled) {
      messageApi.info(getLang("extension_not_enable"))
      return
    }
    chrome.tabs.create({ url: item.optionsUrl })
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

  // 如果存在别名，则显示别名
  const showName = item.__attach__?.alias ? item.__attach__?.alias : item.name

  return (
    <div
      onMouseEnter={(e) => onItemMouseOver(e)}
      onMouseLeave={(e) => onItemMouseOver(e)}
      className={classNames([
        "list-item-container",
        { "is-enable": itemEnable, "not-enable": !itemEnable, "item-is-top": item.__top__ }
      ])}>
      {contextHolder}

      <div className="list-item-img-box">
        <img src={getIcon(item, 128)} alt="" />
        {itemPined && isShowDotOfFixedExtension && <i className="list-item-fix-dot"></i>}
      </div>

      <span className="ext-name" onClick={(e) => onItemNameClick(e, item)}>
        {showName}
      </span>
      {buildOperationButton(isHover || isShowOperationButton)}
    </div>
  )

  function buildOperationButton(isHover) {
    if (!isHover) {
      return null
    } else {
      return (
        <div className="li-operation">
          <Switch
            className="switch"
            size="small"
            checked={itemEnable}
            onChange={(e) => onSwitchChange(e, item)}></Switch>

          {canLock && (
            <Button
              type="text"
              icon={itemPined ? <LockOutlined /> : <UnlockOutlined />}
              onClick={() => setItemPined(!itemPined)}
            />
          )}

          <Button
            disabled={!existOptionPage}
            type="text"
            icon={<SettingOutlined />}
            onClick={(e) => handleSettingButtonClick(e, item)}
          />

          {/* <Popconfirm
            title={getLang("remove_extension")}
            description={getLang("remove_extension_confirm", item.shortName)}
            onConfirm={(e) => confirmDeleteExtension(e, item)}
            onCancel={(e) => cancelDeleteExtension(e, item)}
            onClick={(e) => setIsInteractive(true)}
            okText="Yes"
            cancelText="Cancel">
            <Button type="text" icon={<DeleteOutlined />} />
          </Popconfirm> */}

          <Button
            type="text"
            icon={<DeleteOutlined />}
            onClick={(e) => confirmDeleteExtension(e, item)}
          />

          <Button
            disabled={!existHomePage}
            type="text"
            icon={<HomeOutlined />}
            onClick={(e) => handleHomeButtonClick(e, item)}
          />

          <Button
            type="text"
            icon={<ToolOutlined />}
            onClick={(e) => handleOriginSettingButtonClick(e, item)}></Button>
        </div>
      )
    }
  }
})

export default ExtensionListItem
