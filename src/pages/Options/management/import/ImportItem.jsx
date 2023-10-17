import React, { memo, useEffect, useState } from "react"

import { Button, Checkbox, Radio, Steps } from "antd"
import classNames from "classnames"
import styled from "styled-components"

import PuzzleImage from ".../assets/img/puzzle.svg"
import analytics from ".../utils/googleAnalyze"
import { getLang } from ".../utils/utils"
import ExtensionChannelLabel from "../ExtensionChannelLabel"
import { downloadImage } from "./helper/imageHelper"

const ImportItem = memo(({ extension, storeSource, installed, onSelectChanged }) => {
  const [selected, setSelected] = useState(false)
  const [icon, setIcon] = useState(null)

  const openStore = (e) => {
    e.stopPropagation()
    extension.openStoreLink(extension, storeSource)

    analytics.fireEvent("extension_import_open_single_link")
  }

  useEffect(() => {
    onSelectChanged?.(extension, selected)
  }, [extension, selected, onSelectChanged])

  useEffect(() => {
    if (extension.icon) {
      setIcon(extension.icon)
      return
    }

    downloadImage(extension).then((image) => {
      if (image) {
        setIcon(image)
      }
    })
  }, [extension])

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
        <img src={icon ?? PuzzleImage} width={36} height={36} alt="logo" />

        <div className="ext-title-info">
          <span className="ext-title">
            <span>{extension.name}</span>
            <ExtensionChannelLabel channel={extension.channel}></ExtensionChannelLabel>
          </span>
          <span className="ext-info-more">
            <span>ID: {extension.id}</span>
            <span>
              {getLang("column_alias")}: {extension.alias}
            </span>
            <span>
              {getLang("column_remark")}: {extension.remark}
            </span>
          </span>
        </div>

        {!installed && extension.webStoreUrl && (
          <div className="ext-import-operations">
            <Button className="ext-import-btn" type="primary" onClick={openStore}>
              {getLang("management_open_web_store")}
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
