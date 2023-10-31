import React, { memo, useEffect, useState } from "react"

import { QuestionCircleOutlined } from "@ant-design/icons"
import { Button, Popconfirm, Radio, Segmented, Slider, Switch, Tooltip, message } from "antd"

import { getLang } from ".../utils/utils"

const GroupAndSortSetting = memo(({ setting, onSettingChange }) => {
  // 是否按分组显示
  const [isDisplayByGroup, setIsDisplayByGroup] = useState(false)
  // 置顶显示最近更新的扩展
  const [isTopRecentlyUpdate, setIsTopRecentlyUpdate] = useState(false)
  // 最近更新或者最近安装
  const [topRecentlyMode, setTopRecentlyMode] = useState("install")
  // 最近更新的计算天数
  const [topRecentlyDays, setTopRecentlyDays] = useState(7)

  // Popup 中，按照频率进行排序
  const [isSortByFrequency, setIsSortByFrequency] = useState(false)

  useEffect(() => {
    const displayByGroup = setting.isDisplayByGroup ?? false
    setIsDisplayByGroup(displayByGroup)
    const topRecentlyUpdate = setting.isTopRecentlyUpdate ?? false
    setIsTopRecentlyUpdate(topRecentlyUpdate)
    const recentlyMode = setting.topRecentlyMode ?? "install"
    setTopRecentlyMode(recentlyMode)
    const recentlyDays = setting.topRecentlyDays ?? 7
    setTopRecentlyDays(recentlyDays)

    const sortByFrequency = setting.isSortByFrequency ?? false
    setIsSortByFrequency(sortByFrequency)
  }, [setting])

  return (
    <div>
      {/* 是否按分组来展示扩展 */}
      <div className="setting-item">
        <span>{getLang("setting_ui_show_by_group")}</span>
        <Switch
          size="small"
          checked={isDisplayByGroup}
          onChange={(value) =>
            onSettingChange(value, setIsDisplayByGroup, "isDisplayByGroup")
          }></Switch>
      </div>

      {/* 是否置顶显示最近更新的扩展 */}
      <div className="setting-item">
        <span>{getLang("setting_ui_top_recently_update")}</span>
        <Switch
          size="small"
          checked={isTopRecentlyUpdate}
          onChange={(value) =>
            onSettingChange(value, setIsTopRecentlyUpdate, "isTopRecentlyUpdate")
          }></Switch>
      </div>

      {/* 最近更新或者最近安装 */}
      {isTopRecentlyUpdate && (
        <div className="setting-item">
          <span>
            ↑ {getLang("setting_ui_top_recently_install_or_update")}
            <Tooltip
              placement="top"
              title={getLang("setting_ui_top_recently_install_or_update_tip")}>
              <QuestionCircleOutlined />
            </Tooltip>
          </span>

          <Radio.Group
            size="small"
            value={topRecentlyMode}
            onChange={(e) =>
              onSettingChange(e.target.value, setTopRecentlyMode, "topRecentlyMode")
            }>
            <Radio value="install">{getLang("setting_ui_top_recently_install_select")}</Radio>
            <Radio value="update">{getLang("setting_ui_top_recently_update_select")}</Radio>
          </Radio.Group>
        </div>
      )}

      {/* 最近更新的计算天数 */}
      {isTopRecentlyUpdate && (
        <div className="setting-item">
          <span>↑ {getLang("setting_ui_top_recently_days")}</span>
          <Radio.Group
            size="small"
            value={topRecentlyDays}
            onChange={(e) =>
              onSettingChange(e.target.value, setTopRecentlyDays, "topRecentlyDays")
            }>
            <Radio value={7}>7 Days</Radio>
            <Radio value={15}>15 Days</Radio>
            <Radio value={30}>30 Days</Radio>
          </Radio.Group>
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
          size="small"
          checked={isSortByFrequency}
          onChange={(value) =>
            onSettingChange(value, setIsSortByFrequency, "isSortByFrequency")
          }></Switch>
      </div>
    </div>
  )
})

export default GroupAndSortSetting
