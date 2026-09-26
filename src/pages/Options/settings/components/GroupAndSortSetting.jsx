import React, { memo, useEffect, useState } from "react"

import { QuestionCircleOutlined } from "@ant-design/icons"
import { Radio, Switch, Tooltip } from "antd"

import { getLang } from ".../utils/utils"

const GroupAndSortSetting = memo(({ setting, onSettingChange }) => {
  // 是否按分组显示
  const [isDisplayByGroup, setIsDisplayByGroup] = useState(false)
  // 置顶显示最近启用的扩展
  const [isTopRecentlyEnabled, setIsTopRecentlyEnabled] = useState(false)
  // 置顶显示最近更新的扩展
  const [isTopRecentlyUpdate, setIsTopRecentlyUpdate] = useState(false)
  // 最近更新或者最近安装
  const [topRecentlyMode, setTopRecentlyMode] = useState("install")
  // 最近更新的计算天数
  const [topRecentlyDays, setTopRecentlyDays] = useState(7)
  // 默认的排序方式(仅在按分组显示时有效)
  const [defaultSortField, setDefaultSortField] = useState("name")

  // Popup 中，按照频率进行排序
  const [isSortByFrequency, setIsSortByFrequency] = useState(false)
  // Popup 中，是否启用或禁用扩展之后，立即刷新列表，重新排序
  const [isRefreshAfterEnableDisable, setIsRefreshAfterEnableDisable] = useState(true)

  // 初始化
  useEffect(() => {
    const displayByGroup = setting.isDisplayByGroup ?? false
    setIsDisplayByGroup(displayByGroup)
    const topRecentlyEnabled = setting.isTopRecentlyEnabled ?? false
    setIsTopRecentlyEnabled(topRecentlyEnabled)
    const topRecentlyUpdate = setting.isTopRecentlyUpdate ?? false
    setIsTopRecentlyUpdate(topRecentlyUpdate)
    const recentlyMode = setting.topRecentlyMode ?? "install"
    setTopRecentlyMode(recentlyMode)
    const recentlyDays = setting.topRecentlyDays ?? 7
    setTopRecentlyDays(recentlyDays)
    const sortField = setting.defaultSortField ?? "name"
    setDefaultSortField(sortField)

    const sortByFrequency = setting.isSortByFrequency ?? false
    setIsSortByFrequency(sortByFrequency)
    const refreshAfterEnableDisable = setting.isRefreshAfterEnableDisable ?? true
    setIsRefreshAfterEnableDisable(refreshAfterEnableDisable)
  }, [setting])

  return (
    <div>
      {/* 是否按分组来展示扩展 */}
      <div className="setting-item">
        <span>{getLang("setting_ui_show_by_group")}</span>
        <Switch
          aria-label={getLang("setting_ui_show_by_group")}
          checked={isDisplayByGroup}
          onChange={(value) =>
            onSettingChange(value, setIsDisplayByGroup, "isDisplayByGroup")
          }></Switch>
      </div>

      {/* 是否置顶显示最近启用的扩展 */}
      <div className="setting-item">
        <span>{getLang("setting_ui_top_recently_enabled")}</span>
        <Switch
          aria-label={getLang("setting_ui_top_recently_enabled")}
          checked={isTopRecentlyEnabled}
          onChange={(value) =>
            onSettingChange(value, setIsTopRecentlyEnabled, "isTopRecentlyEnabled")
          }></Switch>
      </div>

      {/* 是否置顶显示最近更新的扩展 */}
      <div className="setting-item">
        <span>{getLang("setting_ui_top_recently_update")}</span>
        <Switch
          aria-label={getLang("setting_ui_top_recently_update")}
          checked={isTopRecentlyUpdate}
          onChange={(value) =>
            onSettingChange(value, setIsTopRecentlyUpdate, "isTopRecentlyUpdate")
          }></Switch>
      </div>

      {/* 最近更新或者最近安装 */}
      {isTopRecentlyUpdate && (
        <div className="setting-dependent">
          <div className="setting-item">
            <span>
              {getLang("setting_ui_top_recently_install_or_update")}
              <Tooltip
                placement="top"
                title={getLang("setting_ui_top_recently_install_or_update_tip")}>
                <QuestionCircleOutlined />
              </Tooltip>
            </span>

            <Radio.Group
              aria-label={getLang("setting_ui_top_recently_install_or_update")}
              value={topRecentlyMode}
              onChange={(e) =>
                onSettingChange(e.target.value, setTopRecentlyMode, "topRecentlyMode")
              }>
              <Radio value="install">{getLang("setting_ui_top_recently_install_select")}</Radio>
              <Radio value="update">{getLang("setting_ui_top_recently_update_select")}</Radio>
            </Radio.Group>
          </div>
          {/* 最近更新的计算天数 */}
          <div className="setting-item">
            <span>{getLang("setting_ui_top_recently_days")}</span>
            <Radio.Group
              aria-label={getLang("setting_ui_top_recently_days")}
              value={topRecentlyDays}
              onChange={(e) =>
                onSettingChange(e.target.value, setTopRecentlyDays, "topRecentlyDays")
              }>
              <Radio value={1}>1 Day</Radio>
              <Radio value={7}>7 Days</Radio>
              <Radio value={15}>15 Days</Radio>
              <Radio value={30}>30 Days</Radio>
            </Radio.Group>
          </div>
        </div>
      )}

      {/* 排序：按照启用频率进行排序 */}
      <div className="setting-item">
        <span>
          {getLang("setting_list_sort_type")}
          <Tooltip placement="top" title={getLang("setting_list_sort_type_tip")}>
            <QuestionCircleOutlined />
          </Tooltip>{" "}
        </span>
        <Switch
          aria-label={getLang("setting_list_sort_type")}
          checked={isSortByFrequency}
          onChange={(value) =>
            onSettingChange(value, setIsSortByFrequency, "isSortByFrequency")
          }></Switch>
      </div>

      {/* 排序：默认排序方式 */}
      {isDisplayByGroup && (
        <div className="setting-item">
          <span>{getLang("setting_list_default_sort_field")}</span>
          <Radio.Group
            aria-label={getLang("setting_list_default_sort_field")}
            value={defaultSortField}
            onChange={(e) =>
              onSettingChange(e.target.value, setDefaultSortField, "defaultSortField")
            }>
            <Radio value="enable">{getLang("setting_list_default_sort_field_enable")}</Radio>
            <Radio value="name">{getLang("setting_list_default_sort_field_name")}</Radio>
          </Radio.Group>
        </div>
      )}

      {/* 启用或禁用扩展之后，立即刷新列表，重新排序 */}
      <div className="setting-item">
        <span>{getLang("setting_ui_refresh_after_enable_disable")}</span>
        <Switch
          aria-label={getLang("setting_ui_refresh_after_enable_disable")}
          checked={isRefreshAfterEnableDisable ?? true}
          onChange={(value) =>
            onSettingChange(value, setIsRefreshAfterEnableDisable, "isRefreshAfterEnableDisable")
          }></Switch>
      </div>
    </div>
  )
})

export default GroupAndSortSetting
