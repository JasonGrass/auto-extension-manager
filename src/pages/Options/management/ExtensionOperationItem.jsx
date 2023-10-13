import React, { memo, useEffect, useState } from "react"

import { DeleteOutlined, HomeOutlined, SettingOutlined } from "@ant-design/icons"
import { Popconfirm, Space, Switch, Tooltip, message } from "antd"
import classNames from "classnames"
import styled from "styled-components"

import { getHomepageUrl } from ".../utils/extensionHelper"
import { getLang } from ".../utils/utils"

const ExtensionOperationItem = memo(({ record, options }) => {
  const [messageApi, contextHolder] = message.useMessage()
  const [itemEnable, setItemEnable] = useState(record.enabled)

  /**
   * 启用与禁用扩展
   */
  const onSwitchChange = async (checked, item) => {
    await chrome.management.setEnabled(item.id, checked)
    setItemEnable(checked)
    item.enabled = checked
  }

  /**
   * 打开扩展设置页面
   */
  const handleSettingButtonClick = (e, item) => {
    e.stopPropagation()
    if (item.optionsUrl) {
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
    e.stopPropagation()
    const url = getHomepageUrl(item, options.setting.isHomeLinkToStore)
    if (url) {
      chrome.tabs.create({ url })
    }
  }

  /**
   * 删除扩展
   */
  const confirmDeleteExtension = (e, item) => {
    e.stopPropagation()
    chrome.management.uninstall(item.id)
  }

  return (
    <Style onClick={(e) => e.stopPropagation()}>
      {contextHolder}

      <Switch
        size="small"
        checked={itemEnable}
        onClick={(e) => e.stopPropagation()}
        onChange={(e) => onSwitchChange(e, record)}></Switch>

      <Space
        className={classNames({
          "operation-menu-item-disabled": !record.optionsUrl,
          "operation-menu-item": record.optionsUrl
        })}
        onClick={(e) => handleSettingButtonClick(e, record)}>
        <SettingOutlined />
      </Space>

      <Popconfirm
        title={getLang("remove_extension")}
        description={getLang("remove_extension_confirm", record.shortName)}
        onConfirm={(e) => confirmDeleteExtension(e, record)}
        okText="Yes"
        cancelText="Cancel">
        <Space className="operation-menu-item">
          <DeleteOutlined />
        </Space>
      </Popconfirm>

      <Space
        className={classNames({
          "operation-menu-item-disabled": !record.homepageUrl,
          "operation-menu-item": record.homepageUrl
        })}
        onClick={(e) => handleHomeButtonClick(e, record)}>
        <HomeOutlined />
      </Space>
    </Style>
  )
})

export default ExtensionOperationItem

const Style = styled.span`
  display: flex;
  align-items: center;

  .operation-menu-item-disabled {
    color: #ccc;
    margin-left: 16px;
    font-size: 14px;
    transform: scale(1.4);
  }

  .operation-menu-item {
    margin-left: 16px;
    font-size: 14px;
    transform: scale(1.4);

    &:hover {
      transform: scale(1.6);
      color: #346dbc;
      text-shadow: 2px 2px 4px #24bfc4;
    }
  }
`
