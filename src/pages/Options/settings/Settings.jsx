import React, { memo, useCallback, useEffect, useState } from "react"

import { QuestionCircleOutlined } from "@ant-design/icons"
import { Button, Popconfirm, Radio, Slider, Switch, Tooltip, message } from "antd"
import { fromJS } from "immutable"

import storage from ".../storage/sync"
import { getLang } from ".../utils/utils"
import Title from "../Title.jsx"
import { exportConfig, importConfig } from "./ConfigFileBackup.ts"
import { MAX_COLUMN_COUNT, MIN_COLUMN_COUNT } from "./SettingConst.js"
import { SettingStyle } from "./SettingStyle.js"
import SearchSetting from "./components/SearchSetting.jsx"

function Settings() {
  const [setting, setSetting] = useState({})

  // 是否显示 APP
  const [isShowApp, setIsShowApp] = useState(false)
  // 是否总是显示扩展操作按钮
  const [isShowItemOperationAlways, setIsShowItemOperationAlways] = useState(false)

  // 是否在 Popup 中，展示固定分组中的扩展
  const [isShowFixedExtension, setIsShowFixedExtension] = useState(true)
  // 是否显示固定分组扩展上面的小圆点
  const [isShowDotOfFixedExtension, setIsShowDotOfFixedExtension] = useState(true)
  // 网格视图下，显示 APP 名称
  const [isShowAppNameInGirdView, setIsShowAppNameInGirdView] = useState(false)
  // 网格视图下，每行显示的扩展个数
  const [columnCountInGirdView, setColumnCountInGirdView] = useState(6)
  // 网格视图下，禁用扩展使用灰色样式
  const [isGaryStyleOfDisableInGridView, setIsGaryStyleOfDisableInGridView] = useState(false)
  // Popup 中，按照频率进行排序
  const [isSortByFrequency, setIsSortByFrequency] = useState(false)
  // Popup 暗色模式
  const [darkMode, setDarkMode] = useState("system")

  // 切换分组时，是否执行扩展启用与禁用
  const [isRaiseEnableWhenSwitchGroup, setIsRaiseEnableWhenSwitchGroup] = useState(false)
  // 分组切换时，是否支持多选
  const [isSupportMultiSelectGroup, setIsSupportMultiSelectGroup] = useState(false)

  const [messageApi, contextHolder] = message.useMessage()

  // 初始化
  useEffect(() => {
    const showApp = setting.isShowApp ?? false
    setIsShowApp(showApp)
    const showItemOperationAlways = setting.isShowItemOperationAlways ?? false
    setIsShowItemOperationAlways(showItemOperationAlways)

    const showFixedExtension = setting.isShowFixedExtension ?? true
    setIsShowFixedExtension(showFixedExtension)
    const showAppNameInGridView = setting.isShowAppNameInGirdView ?? false
    setIsShowAppNameInGirdView(showAppNameInGridView)

    const sortByFrequency = setting.isSortByFrequency ?? false
    setIsSortByFrequency(sortByFrequency)
    const initDarkMode = setting.darkMode ?? "system"
    setDarkMode(initDarkMode)

    // 功能偏好
    const raiseEnableWhenSwitchGroup = setting.isRaiseEnableWhenSwitchGroup ?? false
    setIsRaiseEnableWhenSwitchGroup(raiseEnableWhenSwitchGroup)
    const supportMultiSelectGroup = setting.isSupportMultiSelectGroup ?? false
    setIsSupportMultiSelectGroup(supportMultiSelectGroup)

    // 网格视图下的列数
    let tempColumnInGirdView = Number(setting.columnCountInGirdView)
    if (
      Number.isNaN(tempColumnInGirdView) ||
      tempColumnInGirdView < MIN_COLUMN_COUNT ||
      tempColumnInGirdView > MAX_COLUMN_COUNT
    ) {
      tempColumnInGirdView = MIN_COLUMN_COUNT
    }
    setColumnCountInGirdView(tempColumnInGirdView)

    // 禁用扩展使用灰色样式
    const grayWhenDisable = setting.isGaryStyleOfDisableInGridView ?? false
    setIsGaryStyleOfDisableInGridView(grayWhenDisable)

    // 固定分组扩展的小圆点
    const dotOfFixedExtension = setting.isShowDotOfFixedExtension ?? true
    setIsShowDotOfFixedExtension(dotOfFixedExtension)
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

        {/* 显示 APP 类型的扩展 */}
        <div className="setting-item">
          <span>
            {getLang("setting_ui_show_app")}
            <Tooltip placement="top" title={getLang("setting_ui_show_app_tip")}>
              <QuestionCircleOutlined />
            </Tooltip>{" "}
          </span>
          <Switch
            size="small"
            checked={isShowApp}
            onChange={(value) => onSettingChange(value, setIsShowApp, "isShowApp")}></Switch>
        </div>

        {/* 显示固定分组中的扩展 */}
        <div className="setting-item">
          <span>
            {getLang("setting_ui_show_fixed_extension")}
            <Tooltip placement="top" title={getLang("setting_ui_show_fixed_extension_tip")}>
              <QuestionCircleOutlined />
            </Tooltip>{" "}
          </span>
          <Switch
            size="small"
            checked={isShowFixedExtension}
            onChange={(value) =>
              onSettingChange(value, setIsShowFixedExtension, "isShowFixedExtension")
            }></Switch>
        </div>

        {/* 显示固定分组扩展右上角的小圆点 */}
        <div className="setting-item">
          <span>{getLang("setting_ui_show_fixed_dot")}</span>
          <Switch
            size="small"
            checked={isShowDotOfFixedExtension}
            onChange={(value) =>
              onSettingChange(value, setIsShowDotOfFixedExtension, "isShowDotOfFixedExtension")
            }></Switch>
        </div>

        {/* 列表视图下，始终显示快捷操作按钮（默认 hover 显示） */}
        <div className="setting-item">
          <span>{getLang("setting_list_view_show_button")}</span>
          <Switch
            size="small"
            checked={isShowItemOperationAlways}
            onChange={(value) =>
              onSettingChange(value, setIsShowItemOperationAlways, "isShowItemOperationAlways")
            }></Switch>
        </div>

        {/* 网格视图下，显示扩展名称 */}
        <div className="setting-item">
          <span>
            {getLang("setting_list_gird_show_name")}
            <Tooltip placement="top" title={getLang("setting_list_gird_show_name_tip")}>
              <QuestionCircleOutlined />
            </Tooltip>{" "}
          </span>
          <Switch
            size="small"
            checked={isShowAppNameInGirdView}
            onChange={(value) =>
              onSettingChange(value, setIsShowAppNameInGirdView, "isShowAppNameInGirdView")
            }></Switch>
        </div>

        {/* 网格视图下，扩展显示的列数 */}
        <div className="setting-item">
          <span>
            {getLang("setting_list_gird_show_column_number")} ({columnCountInGirdView})
          </span>
          <Slider
            style={{ width: 100, margin: "0 10px 0 0" }}
            defaultValue={30}
            value={columnCountInGirdView}
            onChange={(value) =>
              onSettingChange(value, setColumnCountInGirdView, "columnCountInGirdView")
            }
            min={MIN_COLUMN_COUNT}
            max={MAX_COLUMN_COUNT}
            step={1}
          />
        </div>

        {/* 网格视图下，使用灰色样式显示被禁用的扩展 */}
        <div className="setting-item">
          <span>{getLang("setting_list_gird_show_disable_gray")}</span>
          <Switch
            size="small"
            checked={isGaryStyleOfDisableInGridView}
            onChange={(value) =>
              onSettingChange(
                value,
                setIsGaryStyleOfDisableInGridView,
                "isGaryStyleOfDisableInGridView"
              )
            }></Switch>
        </div>

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

        {/* 暗色模式 */}
        <div className="setting-item">
          <span>{getLang("setting_dark_mode_title")}</span>
          <Radio.Group
            size="small"
            onChange={(e) => {
              onSettingChange(e.target.value, setDarkMode, "darkMode")
            }}
            value={darkMode}>
            <Radio value="light">{getLang("setting_dark_mode_light")}</Radio>
            <Radio value="dark">{getLang("setting_dark_mode_dark")}</Radio>
            <Radio value="system">{getLang("setting_dark_mode_system")}</Radio>
          </Radio.Group>
        </div>
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
