import React, { memo, useEffect, useState } from "react"

import { Button, Checkbox, Radio, Steps } from "antd"
import classNames from "classnames"
import styled from "styled-components"

import PuzzleImage from ".../assets/img/puzzle.svg"
import ExtensionChannelLabel from "../ExtensionChannelLabel"

const ImportItem = memo(({ extension, storeSource, installed, onSelectChanged }) => {
  const [selected, setSelected] = useState(false)

  const openStore = (e) => {
    e.stopPropagation()
    extension.openStoreLink(extension, storeSource)
  }

  useEffect(() => {
    onSelectChanged?.(extension, selected)
  }, [extension, selected, onSelectChanged])

  return (
    <Style>
      <div
        onClick={(e) => {
          if (!installed) {
            setSelected((prev) => !prev)
          }
        }}
        className={classNames({
          "import-item-select": selected,
          "import-item-container": true
        })}>
        <img src={extension.icon ?? PuzzleImage} width={36} height={36} alt="logo" />

        <div className="ext-title-info">
          <span className="ext-title">
            <span>{extension.name}</span>
            <ExtensionChannelLabel channel={extension.channel}></ExtensionChannelLabel>
          </span>
          <span className="ext-info-more">
            <span>ID: {extension.id}</span>
            <span>别名: {extension.alias}</span>
            <span>备注: {extension.remark}</span>
          </span>
        </div>

        {!installed && extension.webStoreUrl && (
          <div className="ext-import-operations">
            <Button className="ext-import-btn" type="primary" onClick={openStore}>
              打开应用商店
            </Button>
          </div>
        )}
      </div>
    </Style>
  )
})

export default ImportItem

const Style = styled.div`
  margin-top: 8px;

  .import-item-container {
    display: flex;
    align-items: center;

    height: 60px;
    padding: 12px 12px 8px 12px;

    border: 1px solid #e8e8e8;
    border-radius: 4px;
  }

  .import-item-select {
    background-color: #e5e5e5;
  }

  .ext-title-info {
    display: flex;
    flex-direction: column;

    height: 100%;

    margin: 0 0 0 12px;

    .ext-title {
      margin-bottom: 12px;
      font-size: 12px;
      font-weight: bold;
    }

    .ext-info-more {
      color: #888;

      & > span {
        margin-right: 12px;
      }
    }
  }

  .ext-import-operations {
    margin: 0 0 0 auto;
  }
`
