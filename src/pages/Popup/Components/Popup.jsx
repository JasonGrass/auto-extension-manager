import React, { useEffect, useState } from "react"

import classNames from "classnames"
import { styled } from "styled-components"

import { getPopupWidth } from ".../pages/Popup/utils/popupLayoutHelper"
import { isExtExtension } from "../../../utils/extensionHelper.js"
import { handleExtensionOnOff } from "../ExtensionOnOffHandler.js"
import { useSearchController } from "../hooks/useSearchController"
import { useShowAppController } from "../hooks/useShowAppController"
import AppList from "./AppList"
import Header from "./Header"
import ExtensionGrid from "./grid-view/ExtensionGridView.jsx"
import ExtensionList from "./list-view/ExtensionListView"

function IndexPopup({ originExtensions, options, params }) {
  const [extensions, setExtensions] = useState(originExtensions)

  // 启用的扩展数量（不包括 APP 类型）
  const [activeExtensionCount, setActiveExtensionCount] = useState(0)
  // 总扩展数量，不包括 APP 类型
  const [allExtensionCount, setAllExtensionCount] = useState(0)

  // 是否显示 APP 类型扩展
  const [isShowAppExtension, setIsShowAppExtension] = useShowAppController(options)

  // 搜索控制
  const [pluginExtensions, appExtensions, onSearchByTextChange, onSearchByGroupChange] =
    useSearchController(extensions)

  // 布局样式
  const [layout, setLayout] = useState(options.setting.layout)

  // 数量显示
  useEffect(() => {
    const list = extensions.filter((ext) => isExtExtension(ext))
    setActiveExtensionCount(list.filter((ext) => ext.enabled).length)
    setAllExtensionCount(list.length)
  }, [extensions])

  // 是否在切换分组时，执行扩展的禁用与启用
  const isRaiseEnableWhenSwitchGroup = options.setting?.isRaiseEnableWhenSwitchGroup ?? false

  // 分组切换
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

  // 布局切换
  const onLayoutChanged = (layout) => {
    setLayout(layout)
    document.body.style.width = getPopupWidth(
      layout,
      originExtensions.length,
      options.setting.columnCountInGirdView
    )
  }

  return (
    <Style>
      <div className="header-container">
        <Header
          activeCount={activeExtensionCount}
          totalCount={allExtensionCount}
          options={options}
          onGroupChanged={onGroupChanged}
          onLayoutChanged={onLayoutChanged}
          onSearch={onSearchByTextChange}></Header>
      </div>

      <div
        className={classNames([
          "extension-container",
          { "extension-container-grid": layout === "grid" }
        ])}>
        {!layout || layout === "list" ? (
          <ExtensionList extensions={pluginExtensions} options={options}></ExtensionList>
        ) : (
          <ExtensionGrid
            extensions={pluginExtensions}
            options={options}
            isShowBottomDivider={isShowAppExtension && appExtensions.length > 0}></ExtensionGrid>
        )}

        {isShowAppExtension && <AppList items={appExtensions}></AppList>}
      </div>
    </Style>
  )
}

export default IndexPopup

const Style = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;

  .header-container {
    flex: 0 0 auto;
  }

  .extension-container {
    flex: 1 1 auto;
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

  .extension-container-grid::-webkit-scrollbar {
    display: none; /* Chrome Safari */
  }
`
