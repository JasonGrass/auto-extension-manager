import React, { memo, useEffect, useState } from "react"

import { QuestionCircleOutlined } from "@ant-design/icons"
import { Button, Popconfirm, Radio, Slider, Switch, Tooltip, message } from "antd"

import { getLang } from ".../utils/utils"

const SearchSetting = memo(({ setting, onSettingChange }) => {
  // 是否总是显示搜索栏
  const [isShowSearchBar, setIsShowSearchBar] = useState(false)
  // 是否支持跳转到应用商店搜索
  const [isSupportSearchAppStore, setIsSupportSearchAppStore] = useState(false)

  useEffect(() => {
    const showSearchBar = setting.isShowSearchBarDefault ?? false
    setIsShowSearchBar(showSearchBar)

    const supportSearchAppStore = setting.isSupportSearchAppStore ?? false
    setIsSupportSearchAppStore(supportSearchAppStore)
  }, [setting])

  return (
    <div>
      {/* 搜索框：默认显示（未开启时点击 🔍 显示） */}
      <div className="setting-item">
        <span>
          {getLang("setting_ui_search_display")}
          <Tooltip placement="top" title={getLang("setting_ui_search_display_tip")}>
            <QuestionCircleOutlined />
          </Tooltip>{" "}
        </span>
        <Switch
          size="small"
          checked={isShowSearchBar}
          onChange={(value) =>
            onSettingChange(value, setIsShowSearchBar, "isShowSearchBarDefault")
          }></Switch>
      </div>

      {/* 搜索框：支持跳转应用商店搜索 */}
      <div className="setting-item">
        <span>
          {getLang("setting_ui_search_jump")}
          <Tooltip placement="top" title={getLang("setting_ui_search_jump_tip")}>
            <QuestionCircleOutlined />
          </Tooltip>{" "}
        </span>
        <Switch
          size="small"
          checked={isSupportSearchAppStore}
          onChange={(value) =>
            onSettingChange(value, setIsSupportSearchAppStore, "isSupportSearchAppStore")
          }></Switch>
      </div>
    </div>
  )
})

export default SearchSetting
