import React, { memo, useState } from "react"

import { Button, Checkbox, Dropdown, Space } from "antd"
import styled from "styled-components"

import ImportItem from "./ImportItem"

const searchSourceItems = [
  {
    label: "Edge/Chrome Official WebStore",
    key: "default"
  },
  {
    label: "crxsoso.com",
    key: "crxsoso"
  }
]

const ImportHandler = memo(({ extensions, options }) => {
  // 扩展搜索源
  const [extensionSearchSource, setExtensionSearchSource] = useState(searchSourceItems[0])

  const handleSourceMenuClick = (e) => {
    const item = searchSourceItems.find((i) => i.key === e.key)
    if (!item) {
      return
    }
    setExtensionSearchSource(item)
  }

  const searchSourceMenuProps = {
    items: searchSourceItems,
    onClick: handleSourceMenuClick
  }

  const handleSourceClick = () => {
    if (extensionSearchSource.key === "crxsoso") {
      chrome.tabs.create({
        url: `https://www.crxsoso.com`
      })
    }
  }

  return (
    <Style>
      <h2 className="import-sub-title">准备导入</h2>

      <div className="import-ext-tools">
        <Button>打开全部扩展的应用商店链接</Button>
        <Button>打开选中扩展的应用商店链接</Button>
        <Checkbox>导入别名</Checkbox>
        <Checkbox>导入备注</Checkbox>

        <Space className="search-source-setting">
          <span style={{ fontSize: 14 }}>应用商店源</span>
          <Dropdown.Button menu={searchSourceMenuProps} onClick={handleSourceClick}>
            {extensionSearchSource.label}
          </Dropdown.Button>
        </Space>
      </div>

      <ul>
        {extensions.map((ext) => {
          return <ImportItem key={ext.id} extension={ext}></ImportItem>
        })}
      </ul>

      <h2 className="import-sub-title">已经安装</h2>

      <ul>
        {extensions.map((ext) => {
          return <ImportItem key={ext.id} extension={ext}></ImportItem>
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
