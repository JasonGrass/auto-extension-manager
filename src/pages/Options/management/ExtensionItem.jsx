import React, { memo, useEffect, useState } from "react"

import { DeleteOutlined, HomeOutlined, SettingOutlined } from "@ant-design/icons"
import { Popconfirm, Space, Switch, Tooltip, message } from "antd"
import classNames from "classnames"
import styled from "styled-components"

import { getLang } from ".../utils/utils"
import ExtensionChannelLabel from "./ExtensionChannelLabel"

/**
 * 扩展管理设置中的列表 Item 项
 */
const ExtensionItem = memo(({ name, record }) => {
  const [messageApi, contextHolder] = message.useMessage()

  const [itemEnable, setItemEnable] = useState(record.enabled)

  useEffect(() => {
    setItemEnable(record.enabled)
  }, [record])

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
    if (item.homepageUrl) {
      chrome.tabs.create({ url: item.homepageUrl })
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
    <Style>
      {contextHolder}

      <span className="column-name">
        <Tooltip placement="topLeft" title={name}>
          <span className="column-name-title-wrapper">
            <img src={record.icon} alt="" width={16} height={16} />
            <span
              className={classNames([
                "column-name-title",
                {
                  "column-name-title-disable": !record.enabled
                }
              ])}>
              {name}
            </span>
          </span>
        </Tooltip>
        <ExtensionChannelLabel channel={record.channel}></ExtensionChannelLabel>
        <span className="column-name-operation" onClick={(e) => e.stopPropagation()}>
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
        </span>
      </span>
    </Style>
  )
})

export default ExtensionItem

const Style = styled.div`
  .column-name {
    display: flex;
    align-items: center;
    position: relative;

    img {
      margin-right: 5px;
    }

    .column-name-title-wrapper {
      display: flex;
      align-items: center;
    }

    .column-name-title {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .column-name-title-disable {
      color: #c1c1c1;
    }

    &:hover .column-name-operation {
      display: flex;
    }
  }

  .column-name-operation {
    display: none;
    align-items: center;

    position: absolute;
    right: 0px;
    padding-left: 32px;

    background: linear-gradient(90deg, #fafafa00, #fafafa, #fafafa, #fafafa, #fafafa, #fafafa);
  }

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
