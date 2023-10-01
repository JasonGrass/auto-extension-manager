import React, { memo, useCallback, useEffect, useState } from "react"

import { QuestionCircleOutlined } from "@ant-design/icons"
import { Button, Popconfirm, Radio, Slider, Switch, Tooltip, message } from "antd"
import { fromJS } from "immutable"

import storage from ".../storage/sync"
import { getLang } from ".../utils/utils"
import Title from "../Title.jsx"
import { exportConfig, importConfig } from "./ConfigFileBackup.ts"
import { SettingStyle } from "./SettingStyle.js"
import ContentViewSetting from "./components/ContentViewSetting.jsx"
import SearchSetting from "./components/SearchSetting.jsx"
import ViewOtherSetting from "./components/ViewOtherSetting.jsx"

function Settings() {
  const [setting, setSetting] = useState({})

  // 切换分组时，是否执行扩展启用与禁用
  const [isRaiseEnableWhenSwitchGroup, setIsRaiseEnableWhenSwitchGroup] = useState(false)
  // 分组切换时，是否支持多选
  const [isSupportMultiSelectGroup, setIsSupportMultiSelectGroup] = useState(false)

  const [messageApi, contextHolder] = message.useMessage()

  // 初始化
  useEffect(() => {
    // 功能偏好
    const raiseEnableWhenSwitchGroup = setting.isRaiseEnableWhenSwitchGroup ?? false
    setIsRaiseEnableWhenSwitchGroup(raiseEnableWhenSwitchGroup)
    const supportMultiSelectGroup = setting.isSupportMultiSelectGroup ?? false
    setIsSupportMultiSelectGroup(supportMultiSelectGroup)
  }, [setting])

  // 初始化，从配置中读取设置
  useEffect(() => {
    storage.options.getAll().then((options) => {
      setSetting(options.setting)
    })
  }, [])

  // 选项变化时调用，用于保存配置
  const onSettingChange = useCallback((value, settingHandler, optionKey) => {
    // 更新 UI 上选项的值（受控组件）
    settingHandler(value)
    storage.options.getAll().then((options) => {
      // 将新配置，合并到已经存在的 setting中，然后更新到 storage 中
      const setting = fromJS(options.setting).set(optionKey, value).toJS()
      storage.options.set({ setting: setting })
    })
  }, [])

  const onImportConfig = async () => {
    if (await importConfig()) {
      messageApi.open({
        type: "success",
        content: getLang("setting_import_finish")
      })
      storage.options.getAll().then((options) => {
        setSetting(options.setting)
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

      <h2 className="setting-sub-title">{getLang("setting_popup_ui_setting")}</h2>

      <div className="container">
        <SearchSetting setting={setting} onSettingChange={onSettingChange}></SearchSetting>

        <ContentViewSetting
          setting={setting}
          onSettingChange={onSettingChange}></ContentViewSetting>

        <ViewOtherSetting setting={setting} onSettingChange={onSettingChange}></ViewOtherSetting>
      </div>

      <h2 className="setting-sub-title">{getLang("setting_popup_function_setting")}</h2>

      {/* 切换分组时，启用当前分组扩展，禁用其它的扩展 */}
      <div className="container">
        <div className="setting-item">
          <span>
            {getLang("setting_func_witch_group")}
            <Tooltip placement="top" title={getLang("setting_func_witch_group_tip")}>
              <QuestionCircleOutlined />
            </Tooltip>{" "}
          </span>
          <Switch
            size="small"
            checked={isRaiseEnableWhenSwitchGroup}
            onChange={(value) =>
              onSettingChange(
                value,
                setIsRaiseEnableWhenSwitchGroup,
                "isRaiseEnableWhenSwitchGroup"
              )
            }></Switch>
        </div>
        {/* 支持分组多选 */}
        {isRaiseEnableWhenSwitchGroup && (
          <div className="setting-item">
            <span>{getLang("setting_func_group_allow_multi")}</span>
            <Switch
              size="small"
              checked={isSupportMultiSelectGroup}
              onChange={(value) =>
                onSettingChange(value, setIsSupportMultiSelectGroup, "isSupportMultiSelectGroup")
              }></Switch>
          </div>
        )}
      </div>

      <div className="import-export-container">
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
          okText="Yes"
          cancelText="Cancel"
          onClick={(e) => e.stopPropagation()}>
          <Button danger>{getLang("setting_clear_title")}</Button>
        </Popconfirm>
      </div>
    </SettingStyle>
  )
}

export default memo(Settings)
