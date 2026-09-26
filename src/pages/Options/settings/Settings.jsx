import React, { memo, useCallback, useEffect, useState } from "react"

import { Button, Popconfirm, Tooltip, message } from "antd"
import { fromJS } from "immutable"

import storage from ".../storage/sync"
import { getLang } from ".../utils/utils"
import Title from "../Title.jsx"
import { exportConfig, importConfig } from "./ConfigFileBackup.ts"
import { SettingStyle } from "./SettingStyle.js"
import ContentViewSetting from "./components/ContentViewSetting.jsx"
import FunctionSetting from "./components/FunctionSetting.jsx"
import GroupAndSortSetting from "./components/GroupAndSortSetting.jsx"
import SearchSetting from "./components/SearchSetting.jsx"
import ViewOtherSetting from "./components/ViewOtherSetting.jsx"

function Settings({ themeMode, onThemeChange }) {
  const [setting, setSetting] = useState({})

  const [messageApi, contextHolder] = message.useMessage()

  // 初始化，从配置中读取设置
  useEffect(() => {
    storage.options.getAll().then((options) => {
      setSetting(options.setting)
    })
  }, [])

  // 选项变化时调用，用于保存配置
  const onSettingChange = useCallback(
    (value, settingHandler, optionKey) => {
      // 更新 UI 上选项的值（受控组件）
      settingHandler?.(value)
      if (optionKey === "darkMode") onThemeChange(value)
      storage.options.getAll().then((options) => {
        // 将新配置，合并到已经存在的 setting中，然后更新到 storage 中
        const setting = fromJS(options.setting).set(optionKey, value).toJS()
        storage.options.set({ setting: setting })
      })
    },
    [onThemeChange]
  )

  const onImportConfig = async () => {
    if (await importConfig()) {
      messageApi.open({
        type: "success",
        content: getLang("setting_import_finish")
      })
      storage.options.getAll().then((options) => {
        setSetting(options.setting)
        onThemeChange(options.setting.darkMode ?? "system")
      })
    } else {
      messageApi.open({
        type: "error",
        content: getLang("setting_import_fail")
      })
    }
  }

  const onExportConfig = () => {
    exportConfig()
  }

  /**
   * 恢复默认，将通用设置恢复成默认配置
   */
  const onRestoreDefault = () => {
    storage.options.set({ setting: {} })
    setSetting({})
    onThemeChange("system")
  }

  /**
   * 清空所有配置
   */
  const onClearAllOptions = async () => {
    await chrome.storage.sync.clear()
    chrome.tabs.reload()
  }

  return (
    <SettingStyle>
      {contextHolder}
      <Title title={getLang("setting_title")}></Title>

      <section className="setting-card" aria-labelledby="appearance-title">
        <h2 id="appearance-title" className="setting-section-title">
          {getLang("setting_appearance")}
        </h2>
        <ViewOtherSetting
          setting={setting}
          themeMode={themeMode}
          onSettingChange={onSettingChange}
        />
      </section>

      <section className="setting-card" aria-labelledby="search-title">
        <h2 id="search-title" className="setting-section-title">
          {getLang("setting_popup_setting_search")}
        </h2>
        <SearchSetting setting={setting} onSettingChange={onSettingChange}></SearchSetting>
      </section>

      {/* 内容显示 */}
      <section className="setting-card" aria-labelledby="display-title">
        <h2 id="display-title" className="setting-section-title">
          {getLang("setting_popup_setting_display")}
        </h2>
        <ContentViewSetting
          setting={setting}
          onSettingChange={onSettingChange}></ContentViewSetting>
      </section>

      {/* 分组与排序 */}
      <section className="setting-card" aria-labelledby="sort-title">
        <h2 id="sort-title" className="setting-section-title">
          {getLang("setting_popup_setting_group_sort")}
        </h2>
        <GroupAndSortSetting
          setting={setting}
          onSettingChange={onSettingChange}></GroupAndSortSetting>
      </section>

      <section className="setting-card" aria-labelledby="behavior-title">
        <h2 id="behavior-title" className="setting-section-title">
          {getLang("setting_behavior")}
        </h2>
        <FunctionSetting setting={setting} onSettingChange={onSettingChange}></FunctionSetting>
      </section>

      <section className="setting-card" aria-labelledby="data-title">
        <h2 id="data-title" className="setting-section-title">
          {getLang("setting_data_management")}
        </h2>
        <div className="setting-actions">
          <Button onClick={onImportConfig}>{getLang("setting_import_config")}</Button>
          <Button onClick={onExportConfig}>{getLang("setting_export_config")}</Button>
          <Tooltip placement="top" title={getLang("setting_restore_default_tip")}>
            <Button onClick={onRestoreDefault}>{getLang("setting_restore_default")}</Button>
          </Tooltip>

          <Popconfirm
            title={getLang("setting_clear_confirm_title")}
            description={getLang("setting_clear_confirm_content")}
            onConfirm={onClearAllOptions}
            onCancel={(e) => e.stopPropagation()}
            okText={getLang("setting_clear_title")}
            cancelText={getLang("cancel")}
            onClick={(e) => e.stopPropagation()}>
            <Button danger>{getLang("setting_clear_title")}</Button>
          </Popconfirm>
        </div>
      </section>
    </SettingStyle>
  )
}

export default memo(Settings)
