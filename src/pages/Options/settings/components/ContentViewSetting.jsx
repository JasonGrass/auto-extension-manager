import React, { memo, useEffect, useState } from "react"

import { QuestionCircleOutlined } from "@ant-design/icons"
import { Button, Popconfirm, Radio, Slider, Switch, Tooltip, message } from "antd"

import { getLang } from ".../utils/utils"
import { MAX_COLUMN_COUNT, MIN_COLUMN_COUNT } from "../SettingConst.js"

const ContentViewSetting = memo(({ setting, onSettingChange }) => {
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

  useEffect(() => {
    const showApp = setting.isShowApp ?? false
    setIsShowApp(showApp)

    const showItemOperationAlways = setting.isShowItemOperationAlways ?? false
    setIsShowItemOperationAlways(showItemOperationAlways)

    const showFixedExtension = setting.isShowFixedExtension ?? true
    setIsShowFixedExtension(showFixedExtension)

    const showAppNameInGridView = setting.isShowAppNameInGirdView ?? false
    setIsShowAppNameInGirdView(showAppNameInGridView)

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

  return (
    <div>
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
    </div>
  )
})

export default ContentViewSetting
