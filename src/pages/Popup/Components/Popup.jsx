import React, { useEffect, useState } from "react"

import classNames from "classnames"
import _ from "lodash"
import { styled } from "styled-components"

import {
  filterExtensions,
  isAppExtension,
  isExtExtension
} from ".../utils/extensionHelper"
import AppList from "./AppList"
import ExtensionList from "./ExtensionListView"
import Header from "./Header"

function IndexPopup({ extensions, options, params }) {
  // const getI18N = chrome.i18n.getMessage

  const [pluginExtensions, setPluginExtensions] = useState([])
  const [appExtensions, setAppExtensions] = useState([])

  const [isShowAppExtension, setIsShowAppExtension] = useState(false)
  useEffect(() => {
    setIsShowAppExtension(true)
  }, [])

  useEffect(() => {
    setPluginExtensions(filterExtensions(extensions, isExtExtension))
    setAppExtensions(filterExtensions(extensions, isAppExtension))
  }, [extensions])

  const onGroupChanged = (group) => {
    if (group) {
      const groupExtension = extensions.filter((ext) =>
        group.extensions.includes(ext.id)
      )
      setPluginExtensions(groupExtension)
    } else {
      setPluginExtensions(filterExtensions(extensions, isExtExtension))
    }
  }

  return (
    <Style minHeight={params.minHeight}>
      <div className="header-container">
        <Header
          activeCount={pluginExtensions.filter((ext) => ext.enabled).length}
          totalCount={pluginExtensions.length}
          options={options}
          onGroupChanged={onGroupChanged}></Header>
      </div>

      <div className="extension-container">
        <ExtensionList extensions={pluginExtensions}></ExtensionList>
        {isShowAppExtension && <AppList items={appExtensions}></AppList>}
      </div>
    </Style>
  )
}

export default IndexPopup

const Style = styled.div`
  height: 100%;
  min-height: ${(props) => props.minHeight};

  display: flex;
  flex-direction: column;

  .header-container {
    flex: 1 1 auto;
  }

  .extension-container {
    flex: 1 1 530px;
    overflow: auto;
    margin-left: 0px;
  }

  .extension-container::-webkit-scrollbar {
    width: 4px;
  }

  .extension-container::-webkit-scrollbar-thumb {
    border-radius: 10px;
    -webkit-box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
    opacity: 1;
    background: #cccccc;
  }

  .extension-container::-webkit-scrollbar-track {
    -webkit-box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
    border-radius: 10px;
    background: #cccccc33;
  }
`
