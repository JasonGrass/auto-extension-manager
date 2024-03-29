import React, { memo, useCallback, useState } from "react"

import { Button, Checkbox, Dropdown, Space, message } from "antd"
import styled from "styled-components"

import analytics from ".../utils/googleAnalyze"
import { getLang } from ".../utils/utils"
import ImportItem from "./ImportItem"
import { useAlreadyInstall } from "./helper/useAlreadyInstall"
import { useExtensionInstallListener } from "./helper/useExtensionInstallListener"
import { useExtensionSource } from "./helper/useExtensionSource"
import { useReadyInstall } from "./helper/useReadyInstall"

/**
 * 导入扩展的处理
 */
const ImportHandler = memo(({ extensions, options, inputs }) => {
  const [messageApi, contextHolder] = message.useMessage()

  // 是否导入别名
  const [isImportAlias, setIsImportAlias] = useState(false)
  // 是否导入备注
  const [isImportRemark, setIsImportRemark] = useState(false)

  // 待导入的扩展
  const [inputItems] = useReadyInstall(extensions, inputs)
  // 已经安装的扩展
  const [existItems] = useAlreadyInstall(extensions, inputs, isImportAlias, isImportRemark)

  // 应用商店源
  const [sourceMenuProps, extensionSource, handleSourceClick] = useExtensionSource()

  // 在扩展安装之后，保存别名与备注
  useExtensionInstallListener(inputItems, isImportAlias, isImportRemark)

  // 选中的扩展ID
  const [selectIds, setSelectIds] = useState([])

  const openStoreLink = (ext, source) => {
    if (!ext.webStoreUrl) {
      messageApi.warning(`no valid web store url of ${ext.name}`)
      return
    }

    if (source === "crxsoso") {
      if (ext.channel === "Edge") {
        chrome.tabs.create({
          url: `https://www.crxsoso.com/addon/detail/${ext.id}`
        })
      } else {
        chrome.tabs.create({
          url: `https://www.crxsoso.com/webstore/detail/${ext.id}`
        })
      }
    } else {
      chrome.tabs.create({ url: ext.webStoreUrl })
    }
  }

  const onOpenAllStoreLink = () => {
    for (const ext of inputItems) {
      openStoreLink(ext, extensionSource.key)
    }
    analytics.fireEvent("extension_import_open_all_link")
  }

  const onOpenSelectStoreLink = () => {
    for (const ext of inputItems.filter((i) => selectIds.includes(i.id))) {
      openStoreLink(ext, extensionSource.key)
    }
    analytics.fireEvent("extension_import_open_select_link")
  }

  const onSelectChanged = useCallback((ext, selected) => {
    if (selected) {
      setSelectIds((prev) => {
        return [...prev, ext.id]
      })
    } else {
      setSelectIds((prev) => {
        return prev.filter((id) => id !== ext.id)
      })
    }
  }, [])

  return (
    <Style>
      {contextHolder}
      <h2 className="import-sub-title">{getLang("management_import_prepare")}</h2>

      <div className="import-ext-tools">
        <Button onClick={onOpenAllStoreLink}>{getLang("management_import_open_all_link")}</Button>
        <Button onClick={onOpenSelectStoreLink}>
          {getLang("management_import_open_select_link")}
        </Button>
        <Checkbox checked={isImportAlias} onChange={(e) => setIsImportAlias(e.target.checked)}>
          {getLang("management_import_alias")}
        </Checkbox>
        <Checkbox checked={isImportRemark} onChange={(e) => setIsImportRemark(e.target.checked)}>
          {getLang("management_import_remark")}
        </Checkbox>

        <Space className="search-source-setting">
          <span style={{ fontSize: 14 }}>{getLang("management_import_store_source")}</span>
          <Dropdown.Button menu={sourceMenuProps} onClick={handleSourceClick}>
            {extensionSource.label}
          </Dropdown.Button>
        </Space>
      </div>

      <ul>
        {inputItems.map((ext) => {
          ext.openStoreLink = openStoreLink
          return (
            <ImportItem
              key={ext.id}
              extension={ext}
              storeSource={extensionSource.key}
              onSelectChanged={onSelectChanged}></ImportItem>
          )
        })}
      </ul>

      {existItems.length > 0 && (
        <h2 className="import-sub-title">{getLang("management_import_already")}</h2>
      )}

      <ul>
        {existItems.map((ext) => {
          return <ImportItem key={ext.id} extension={ext} installed></ImportItem>
        })}
      </ul>
    </Style>
  )
})

export default ImportHandler

const Style = styled.div`
  .import-sub-title {
    margin-bottom: 24px;
    font-weight: bold;
  }

  ul {
    margin-bottom: 24px;
  }

  .import-ext-tools {
    display: flex;
    align-items: center;

    margin: 12px 0 12px 0;

    & > button,
    & > label {
      margin: 0 12px 0 0;
    }

    .search-source-setting {
      margin: 0 0 0 auto;
    }
  }
`
