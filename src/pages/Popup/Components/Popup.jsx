import React, { useCallback, useEffect, useLayoutEffect, useMemo, useState } from "react"

import classNames from "classnames"
import { styled } from "styled-components"

import { nanoid } from "nanoid"

import { RuleConfigOptions } from ".../storage/sync/RuleConfigOptions"
import { notifyRuleConfigChanged } from ".../utils/messageHelper"
import { applyPopupWidth } from ".../pages/Popup/utils/popupLayoutHelper"
import { isExtExtension } from "../../../utils/extensionHelper.js"
import { handleGroupExtensionOnOff } from "../ExtensionOnOffHandler.js"
import { useSearchController } from "../hooks/useSearchController"
import { useShowAppController } from "../hooks/useShowAppController"
import { getLang } from ".../utils/utils"
import AppList from "./AppList"
import Header from "./Header"
import ExtensionGrid from "./grid-view/ExtensionGridView.jsx"
import ExtensionGridViewByGroup from "./grid-view/ExtensionGridViewByGroup.jsx"
import ExtensionList from "./list-view/ExtensionListView"
import ExtensionListViewByGroup from "./list-view/ExtensionListViewByGroup.jsx"

function IndexPopup({ originExtensions, options, params }) {
  const [extensions, setExtensions] = useState(originExtensions)
  // 分组开关必须始终反映真实状态，不能受”启停后刷新列表”设置影响。
  const [enabledById, setEnabledById] = useState(() => buildEnabledById(originExtensions))

  // 快速建规则模式
  const [quickRuleMode, setQuickRuleMode] = useState(false)
  // 临时记录用户在快速模式下拨过的扩展状态 { extensionId: desiredEnabled }
  const [quickRuleState, setQuickRuleState] = useState({})
  // 保存中
  const [quickRuleSaving, setQuickRuleSaving] = useState(false)
  const currentTabUrl = params?.currentTabUrl ?? null

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
    applyPopupWidth(
      layout,
      originExtensions.length,
      options.setting.columnCountInGirdView,
      options.setting.zoomRatio
    )
  }, [
    layout,
    originExtensions.length,
    options.setting.columnCountInGirdView,
    options.setting.zoomRatio
  ])

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

  // 一键关闭：保存快照 + 禁用所有扩展
  const onCloseAll = useCallback(async () => {
    const { saveAutoSnapshot } = await import("../utils/autoSnapshot")
    await saveAutoSnapshot()

    const extList = extensions.filter((ext) => isExtExtension(ext))
    for (const ext of extList) {
      if (ext.enabled) {
        await chrome.management.setEnabled(ext.id, false)
        ext.enabled = false
      }
    }

    const newEnabledById = {}
    for (const ext of extensions) {
      newEnabledById[ext.id] = ext.enabled
    }
    setEnabledById(newEnabledById)
    setExtensions([...extensions])
  }, [extensions])

  // 一键打开（恢复快照）：从快照恢复到关闭前的状态
  const onRestoreSnapshot = useCallback(async () => {
    const { loadAutoSnapshot, clearAutoSnapshot } = await import("../utils/autoSnapshot")
    const snapshot = await loadAutoSnapshot()

    if (!snapshot) {
      // 无快照，退化为全部打开
      const extList = extensions.filter((ext) => isExtExtension(ext))
      for (const ext of extList) {
        if (!ext.enabled) {
          await chrome.management.setEnabled(ext.id, true)
          ext.enabled = true
        }
      }
    } else {
      // 恢复快照中的状态
      for (const entry of snapshot.states) {
        const ext = extensions.find((e) => e.id === entry.id)
        if (ext && ext.enabled !== entry.enabled) {
          await chrome.management.setEnabled(entry.id, entry.enabled)
          ext.enabled = entry.enabled
        }
      }
      await clearAutoSnapshot()
    }

    const newEnabledById = {}
    for (const ext of extensions) {
      newEnabledById[ext.id] = ext.enabled
    }
    setEnabledById(newEnabledById)
    setExtensions([...extensions])
  }, [extensions])

  // 全部打开：强制启用所有扩展（不恢复快照）
  const onEnableAll = useCallback(async () => {
    const extList = extensions.filter((ext) => isExtExtension(ext))
    for (const ext of extList) {
      if (!ext.enabled) {
        await chrome.management.setEnabled(ext.id, true)
        ext.enabled = true
      }
    }

    const newEnabledById = {}
    for (const ext of extensions) {
      newEnabledById[ext.id] = ext.enabled
    }
    setEnabledById(newEnabledById)
    setExtensions([...extensions])
  }, [extensions])

  // 快速建规则：进入/退出模式
  const onToggleQuickRuleMode = useCallback(() => {
    setQuickRuleMode((prev) => {
      if (!prev && !currentTabUrl) {
        // 没有有效的当前标签页 URL，无法创建规则
        return false
      }
      const next = !prev
      if (!next) {
        // 退出模式时清空临时状态
        setQuickRuleState({})
      }
      return next
    })
  }, [currentTabUrl])

  // 快速建规则：用户拨动某个扩展开关时记录临时状态
  const onQuickRuleToggle = useCallback((extensionId, desiredEnabled) => {
    setQuickRuleState((prev) => ({
      ...prev,
      [extensionId]: desiredEnabled
    }))
  }, [])

  // 快速建规则：保存规则并刷新页面
  const onQuickRuleSave = useCallback(async () => {
    const modifiedIds = Object.keys(quickRuleState)
    if (modifiedIds.length === 0) {
      setQuickRuleMode(false)
      return
    }

    setQuickRuleSaving(true)

    try {
      // 从 URL 提取域名用于通配符匹配
      let urlPattern = "*"
      let domain = ""
      try {
        const parsed = new URL(currentTabUrl)
        urlPattern = `*${parsed.hostname}*`
        domain = parsed.hostname
      } catch { /* ignore */ }

      // 按期望状态分组
      const toDisable = modifiedIds.filter((id) => quickRuleState[id] === false)
      const toEnable = modifiedIds.filter((id) => quickRuleState[id] === true)

      // 使用 RuleConfigOptions.addOne 保存（与 Options 页面完全一致的数据路径）
      const baseRule = {
        version: 2,
        enable: true,
        match: {
          relationship: "and",
          triggers: [
            {
              trigger: "urlTrigger",
              config: {
                matchMethod: "wildcard",
                matchUrl: [urlPattern],
                useFullUrl: false
              }
            }
          ]
        }
      }

      if (toDisable.length > 0) {
        const rule = {
          ...baseRule,
          id: nanoid(),
          name: domain + " - " + getLang("quick_rule_action_disable_while"),
          target: { groups: [], extensions: toDisable },
          action: {
            actionType: "closeOnlyWhenMatched",
            reloadAfterEnable: true,
            reloadAfterDisable: true
          }
        }
        await RuleConfigOptions.addOne(rule)
      }

      if (toEnable.length > 0) {
        const rule = {
          ...baseRule,
          id: nanoid(),
          name: domain + " - " + getLang("quick_rule_action_enable_while"),
          target: { groups: [], extensions: toEnable },
          action: {
            actionType: "openOnlyWhenMatched",
            reloadAfterEnable: true,
            reloadAfterDisable: true
          }
        }
        await RuleConfigOptions.addOne(rule)
      }

      // 通知 background
      try {
        await notifyRuleConfigChanged()
      } catch {
        // set() 内部已经通知过
      }

      // 通知 background 刷新规则
      try {
        await notifyRuleConfigChanged()
      } catch {
        // set() 内部已经通知过
      }

      // 刷新当前标签页
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true })
      if (tabs[0]?.id) {
        chrome.tabs.reload(tabs[0].id)
      }

      // 关闭 popup
      window.close()
    } catch (error) {
      console.error("[QuickRule] Save failed:", error)
      const debugDiv = document.createElement("div")
      debugDiv.style.cssText = "position:fixed;bottom:0;left:0;right:0;z-index:99999;background:#2a0a0a;color:#f00;padding:8px;font-size:11px;font-family:monospace;"
      debugDiv.textContent = "[QuickRule Error] " + (error?.message || String(error))
      document.body.appendChild(debugDiv)
      setQuickRuleSaving(false)
    }
  }, [quickRuleState, currentTabUrl])

  // 快速建规则：取消
  const onQuickRuleCancel = useCallback(() => {
    setQuickRuleMode(false)
    setQuickRuleState({})
  }, [])

  const getExtensionDisplay = () => {
    const quickRuleProps = { quickRuleMode, quickRuleState, onQuickRuleToggle }
    if (!layout || layout === "list") {
      if (options.setting.isDisplayByGroup) {
        return (
          <ExtensionListViewByGroup
            extensions={pluginExtensions}
            options={displayOptions}
            {...quickRuleProps}></ExtensionListViewByGroup>
        )
      } else {
        return (
          <ExtensionList
            extensions={pluginExtensions}
            options={displayOptions}
            {...quickRuleProps}></ExtensionList>
        )
      }
    } else {
      // 展示样式（是否按分组展示）
      if (options.setting.isDisplayByGroup) {
        return (
          <ExtensionGridViewByGroup
            extensions={pluginExtensions}
            options={displayOptions}
            {...quickRuleProps}
            isShowBottomDivider={
              isShowAppExtension && appExtensions.length > 0
            }></ExtensionGridViewByGroup>
        )
      } else {
        return (
          <ExtensionGrid
            extensions={pluginExtensions}
            options={displayOptions}
            {...quickRuleProps}
            isShowBottomDivider={isShowAppExtension && appExtensions.length > 0}></ExtensionGrid>
        )
      }
    }
  }

  // 快速规则模式下，修改过的扩展数量
  const quickRuleModifiedCount = Object.keys(quickRuleState).length

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
          isDarkMode={params.isDarkMode}
          quickRuleMode={quickRuleMode}
          onToggleQuickRuleMode={onToggleQuickRuleMode}
          currentTabUrl={currentTabUrl}
          activeExtensionCount={activeExtensionCount}
          allExtensionCount={allExtensionCount}
          onCloseAll={onCloseAll}
          onRestoreSnapshot={onRestoreSnapshot}
          onEnableAll={onEnableAll}></Header>
      </div>

      {quickRuleMode && (
        <div className="quick-rule-banner">
          <span className="quick-rule-banner-title">
            {getLang("quick_rule_mode_title")}
          </span>
          <span className="quick-rule-banner-hint">
            {getLang("quick_rule_mode_hint")}
          </span>
          {quickRuleModifiedCount > 0 && (
            <span className="quick-rule-banner-count">
              {getLang("quick_rule_modified_count", quickRuleModifiedCount)}
            </span>
          )}
        </div>
      )}

      <div
        className={classNames([
          "extension-container",
          { "extension-container-grid": layout === "grid" },
          { "extension-container-with-quick-rule": quickRuleMode }
        ])}>
        {getExtensionDisplay()}
        {isShowAppExtension && <AppList items={appExtensions}></AppList>}
      </div>

      {quickRuleMode && (
        <div className="quick-rule-footer">
          <button className="quick-rule-btn-cancel" onClick={onQuickRuleCancel}>
            {getLang("quick_rule_cancel")}
          </button>
          <button
            className="quick-rule-btn-save"
            onClick={onQuickRuleSave}
            disabled={quickRuleSaving || quickRuleModifiedCount === 0}
          >
            {quickRuleSaving
              ? getLang("quick_rule_saving")
              : getLang("quick_rule_save_and_reload")}
          </button>
        </div>
      )}
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

  .quick-rule-banner {
    flex: 0 0 auto;
    padding: 8px 12px;
    background-color: ${(props) => props.theme.primary_color ?? "#1677ff"};
    color: white;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    flex-wrap: wrap;
    position: fixed;
    left: 0;
    right: 0;
    top: var(--header-height);
    z-index: 1;
  }

  .quick-rule-banner-title {
    font-weight: 600;
  }

  .quick-rule-banner-hint {
    opacity: 0.85;
  }

  .quick-rule-banner-count {
    background-color: rgba(255, 255, 255, 0.25);
    padding: 1px 6px;
    border-radius: 8px;
    font-size: 11px;
  }

  .extension-container-with-quick-rule {
    margin-top: calc(var(--header-height) + 36px) !important;
  }

  .quick-rule-footer {
    flex: 0 0 auto;
    display: flex;
    gap: 8px;
    padding: 8px 12px;
    border-top: 1px solid ${(props) => props.theme.input_border ?? "#d9d9d9"};
  }

  .quick-rule-btn-cancel,
  .quick-rule-btn-save {
    flex: 1;
    padding: 6px 12px;
    border: none;
    border-radius: 4px;
    font-size: 13px;
    cursor: pointer;
    transition: opacity 0.2s;
  }

  .quick-rule-btn-cancel {
    background-color: transparent;
    color: ${(props) => props.theme.fg ?? "#333"};
    border: 1px solid ${(props) => props.theme.input_border ?? "#d9d9d9"};
  }

  .quick-rule-btn-save {
    background-color: ${(props) => props.theme.primary_color ?? "#1677ff"};
    color: white;
    font-weight: 500;
  }

  .quick-rule-btn-save:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .list-item-container.quick-rule-modified {
    background-color: rgba(22, 119, 255, 0.06);
    border-left: 2px solid ${(props) => props.theme.primary_color ?? "#1677ff"};
  }
`
