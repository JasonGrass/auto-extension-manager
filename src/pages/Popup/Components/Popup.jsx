import React, { useEffect, useMemo, useState } from "react"

import classNames from "classnames"
import { set } from "immutable"
import _ from "lodash"
import { styled } from "styled-components"

import {
  filterExtensions,
  isAppExtension,
  isExtExtension
} from ".../utils/extensionHelper"
import isMatch from "../../../utils/searchHelper"
import AppList from "./AppList"
import ExtensionList from "./ExtensionListView"
import Header from "./Header"

function IndexPopup({ extensions, options, params }) {
  // const getI18N = chrome.i18n.getMessage

  const [pluginExtensions, setPluginExtensions] = useState([])
  const [appExtensions, setAppExtensions] = useState([])
  const [currentGroup, setGroup] = useState(null)
  const [currentSearch, setSearch] = useState("")

  const [isShowAppExtension, setIsShowAppExtension] = useState(false)
  useEffect(() => {
    setIsShowAppExtension(true)
  }, [])

  useEffect(() => {
    setPluginExtensions(filterExtensions(extensions, isExtExtension))
    setAppExtensions(filterExtensions(extensions, isAppExtension))
  }, [extensions])

  const filterCurrentExtensions = (group, search) => {
    let groupExtensions = []
    if (group) {
      groupExtensions = extensions.filter((ext) =>
        group.extensions.includes(ext.id)
      )
    } else {
      groupExtensions = filterExtensions(extensions, isExtExtension)
    }

    if (!search || search.trim() === "") {
      return groupExtensions
    } else {
      const result = groupExtensions.filter((ext) => {
        return isMatch([ext.name, ext.shortName], search)
      })
      return result
    }
  }

  const onGroupChanged = (group) => {
    setGroup(group)
    setIsShowAppExtension(!group) // 切换到特定分组时，不显示 APP
    const list = filterCurrentExtensions(group, currentSearch)
    setPluginExtensions(list)
  }

  const onSearch = (text) => {
    setSearch(text)
    const list = filterCurrentExtensions(currentGroup, text)
    setPluginExtensions(list)
  }

  return (
    <Style minHeight={params.minHeight}>
      <div className="header-container">
        <Header
          activeCount={pluginExtensions.filter((ext) => ext.enabled).length}
          totalCount={pluginExtensions.length}
          options={options}
          onGroupChanged={onGroupChanged}
          onSearch={onSearch}></Header>
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
