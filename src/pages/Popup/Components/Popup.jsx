import React, { useEffect, useState } from "react"

import { styled } from "styled-components"

import { handleExtensionOnOff } from "../ExtensionOnOffHandler.js"
import { useSearchController } from "../hooks/useSearchController"
import { useShowAppController } from "../hooks/useShowAppController"
import AppList from "./AppList"
import ExtensionList from "./ExtensionListView"
import Header from "./Header"

function IndexPopup({ originExtensions, options, params }) {
  const [extensions, setExtensions] = useState(originExtensions)

  // 是否显示 APP 类型扩展
  const [isShowAppExtension, setIsShowAppExtension] = useShowAppController(options)

  // 搜索控制
  const [pluginExtensions, appExtensions, onSearchByTextChange, onSearchByGroupChange] =
    useSearchController(extensions)

  // 是否在切换分组时，执行扩展的禁用与启用
  const isRaiseEnableWhenSwitchGroup = options.setting?.isRaiseEnableWhenSwitchGroup ?? false

  const onGroupChanged = async (group) => {
    // 如果开启了配置，切换分组意味着：执行扩展的启用与禁用，没有切换显示的功能
    // 如果开启了配置，并且当前组不为空，则执行扩展的启用与禁用
    if (isRaiseEnableWhenSwitchGroup && group) {
      const newExtensions = await handleExtensionOnOff(extensions, options, group)
      setExtensions(newExtensions)
    }

    // 如果没有开启配置，切换分组意味着：切换分组显示，没有扩展启用与禁用功能
    if (!isRaiseEnableWhenSwitchGroup) {
      setIsShowAppExtension(!group) // 切换到特定分组时，不显示 APP
      onSearchByGroupChange(group)
    }
  }

  return (
    <Style mh={params.minHeight}>
      <div className="header-container">
        <Header
          activeCount={extensions.filter((ext) => ext.enabled).length}
          totalCount={extensions.length}
          options={options}
          onGroupChanged={onGroupChanged}
          onSearch={onSearchByTextChange}></Header>
      </div>

      <div className="extension-container">
        <ExtensionList extensions={pluginExtensions} options={options}></ExtensionList>
        {isShowAppExtension && <AppList items={appExtensions}></AppList>}
      </div>
    </Style>
  )
}

export default IndexPopup

const Style = styled.div`
  height: 100%;
  min-height: ${(props) => props.mh};

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
