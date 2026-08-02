import React, { useCallback, useEffect, useLayoutEffect, useMemo, useState } from "react"

import classNames from "classnames"
import { styled } from "styled-components"

import { applyPopupWidth } from ".../pages/Popup/utils/popupLayoutHelper"
import { isExtExtension } from "../../../utils/extensionHelper.js"
import { handleGroupExtensionOnOff } from "../ExtensionOnOffHandler.js"
import { useSearchController } from "../hooks/useSearchController"
import { useShowAppController } from "../hooks/useShowAppController"
import AppList from "./AppList"
import Header from "./Header"
import ExtensionGrid from "./grid-view/ExtensionGridView.jsx"
import ExtensionGridViewByGroup from "./grid-view/ExtensionGridViewByGroup.jsx"
import ExtensionList from "./list-view/ExtensionListView"
import ExtensionListViewByGroup from "./list-view/ExtensionListViewByGroup.jsx"

function IndexPopup({ originExtensions, options, params }) {
  const [extensions, setExtensions] = useState(originExtensions)
  // 分组开关必须始终反映真实状态，不能受“启停后刷新列表”设置影响。
  const [enabledById, setEnabledById] = useState(() => buildEnabledById(originExtensions))

  // 启用的扩展数量（不包括 APP 类型）
  const [activeExtensionCount, setActiveExtensionCount] = useState(0)
  // 总扩展数量，不包括 APP 类型
  const [allExtensionCount, setAllExtensionCount] = useState(0)

  // 是否显示 APP 类型扩展
  const [isShowAppExtension, setIsShowAppExtension] = useShowAppController(options)

  // 搜索控制
  const [
    pluginExtensions,
    appExtensions,
    onSearchByTextChange,
    onSearchByGroupChange,
    currentGroup
  ] = useSearchController(extensions, options)

  // 直接查看固定分组时临时覆盖综合视图的隐藏偏好。
  const displayOptions = useMemo(() => {
    if (currentGroup?.id !== "fixed" || (options.setting.isShowFixedExtension ?? true)) {
      return options
    }

    return {
      ...options,
      setting: {
        ...options.setting,
        isShowFixedExtension: true
      }
    }
  }, [currentGroup, options])

  // 布局样式
  const [layout, setLayout] = useState(options.setting.layout)

  // 等待新布局完成 DOM 更新后再调整 Popup 尺寸，避免旧的 Grid 内容阻止窗口缩小。
  useLayoutEffect(() => {
    applyPopupWidth(layout, originExtensions.length, options.setting.columnCountInGirdView)
  }, [layout, originExtensions.length, options.setting.columnCountInGirdView])

  // 数量显示
  useEffect(() => {
    let list = extensions.filter((ext) => isExtExtension(ext))
    if (!(options.setting.isShowFixedExtension ?? true)) {
      const fixedExtensionIds =
        options.groups.find((group) => group.id === "fixed")?.extensions ?? []
      list = list.filter((ext) => !fixedExtensionIds.includes(ext.id))
    }
    setActiveExtensionCount(list.filter((ext) => enabledById[ext.id] ?? ext.enabled).length)
    setAllExtensionCount(list.length)
  }, [enabledById, extensions, options.groups, options.setting.isShowFixedExtension])

  // 扩展启用与禁用之后，更新显示
  useEffect(() => {
    const refreshAfterEnableDisable = options.setting.isRefreshAfterEnableDisable ?? true
    const updateExtensionEnabled = (info, enabled) => {
      setEnabledById((current) => ({ ...current, [info.id]: enabled }))

      if (!refreshAfterEnableDisable) {
        return
      }

      setExtensions((currentExtensions) => {
        let matched = false
        const nextExtensions = currentExtensions.map((ext) => {
          if (ext.id !== info.id) {
            return ext
          }

          matched = true
          return { ...ext, enabled }
        })

        return matched ? nextExtensions : currentExtensions
      })
    }

    const onEnabled = (info) => {
      updateExtensionEnabled(info, true)
    }
    const onDisabled = (info) => {
      updateExtensionEnabled(info, false)
    }
    chrome.management.onEnabled.addListener(onEnabled)
    chrome.management.onDisabled.addListener(onDisabled)
    return () => {
      chrome.management.onEnabled.removeListener(onEnabled)
      chrome.management.onDisabled.removeListener(onDisabled)
    }
  }, [options.setting.isRefreshAfterEnableDisable])

  useEffect(() => {
    const onFixedGroupChanged = () => {
      // enabledById 的新引用会让 memo 化的 Header 重新计算固定成员排除逻辑。
      setEnabledById((current) => ({ ...current }))
    }
    window.addEventListener("popup-fixed-group-changed", onFixedGroupChanged)
    return () => window.removeEventListener("popup-fixed-group-changed", onFixedGroupChanged)
  }, [])

  // 切换分组只负责切换显示，不再触发任何扩展启停操作。
  const onGroupChanged = useCallback(
    (group) => {
      setIsShowAppExtension(!group)
      onSearchByGroupChange(group)
    },
    [onSearchByGroupChange, setIsShowAppExtension]
  )

  const onGroupEnableChanged = useCallback(
    async (group, enabled) => {
      const result = await handleGroupExtensionOnOff(extensions, options, group, enabled)
      setExtensions(result.extensions)
      setEnabledById(buildEnabledById(result.extensions))
      return result
    },
    [extensions, options]
  )

  // 布局切换
  const onLayoutChanged = (layout) => {
    setLayout(layout)
  }

  const getExtensionDisplay = () => {
    if (!layout || layout === "list") {
      if (options.setting.isDisplayByGroup) {
        return (
          <ExtensionListViewByGroup
            extensions={pluginExtensions}
            options={displayOptions}></ExtensionListViewByGroup>
        )
      } else {
        return (
          <ExtensionList extensions={pluginExtensions} options={displayOptions}></ExtensionList>
        )
      }
    } else {
      // 展示样式（是否按分组展示）
      if (options.setting.isDisplayByGroup) {
        return (
          <ExtensionGridViewByGroup
            extensions={pluginExtensions}
            options={displayOptions}
            isShowBottomDivider={
              isShowAppExtension && appExtensions.length > 0
            }></ExtensionGridViewByGroup>
        )
      } else {
        return (
          <ExtensionGrid
            extensions={pluginExtensions}
            options={displayOptions}
            isShowBottomDivider={isShowAppExtension && appExtensions.length > 0}></ExtensionGrid>
        )
      }
    }
  }

  return (
    <Style>
      <div className="header-container">
        <Header
          activeCount={activeExtensionCount}
          totalCount={allExtensionCount}
          options={options}
          extensions={extensions}
          enabledById={enabledById}
          onGroupChanged={onGroupChanged}
          onGroupEnableChanged={onGroupEnableChanged}
          onLayoutChanged={onLayoutChanged}
          onSearch={onSearchByTextChange}
          isDarkMode={params.isDarkMode}></Header>
      </div>

      <div
        className={classNames([
          "extension-container",
          { "extension-container-grid": layout === "grid" }
        ])}>
        {getExtensionDisplay()}
        {isShowAppExtension && <AppList items={appExtensions}></AppList>}
      </div>
    </Style>
  )
}

export default IndexPopup

function buildEnabledById(extensions) {
  return Object.fromEntries((extensions ?? []).map((ext) => [ext.id, Boolean(ext.enabled)]))
}

const Style = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;

  background-color: ${(props) => props.theme.bg};
  color: ${(props) => props.theme.fg};

  :root {
    /* HeaderStyle 中设置的 Header 高度，不包括搜索框 */
    --header-height: 42px;
  }

  &::-webkit-scrollbar {
    display: none;
  }

  .header-container {
    flex: 0 0 auto;

    position: fixed;
    left: 0;
    right: 0;
    z-index: 1;
  }

  .extension-container {
    flex: 1 1 auto;
    overflow: auto;
    margin-left: 0px;

    /* Header 的高度 */
    margin-top: var(--header-height);

    min-height: 60px;
  }

  .extension-container::-webkit-scrollbar {
    width: 4px;
  }

  .extension-container::-webkit-scrollbar-thumb {
    border-radius: 10px;
    background: ${(props) => props.theme.scrollbar_thumb};
  }

  .extension-container::-webkit-scrollbar-track {
    border-radius: 10px;
    background: ${(props) => props.theme.scrollbar_track};
  }

  .extension-container-grid::-webkit-scrollbar {
    display: none; /* Chrome Safari */
  }
`
