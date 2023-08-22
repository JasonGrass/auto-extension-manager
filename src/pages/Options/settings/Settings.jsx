import React, { memo, useEffect, useState } from "react"

import { QuestionCircleOutlined } from "@ant-design/icons"
import { Button, Slider, Switch, Tooltip, message } from "antd"
import { fromJS } from "immutable"

import OptionsStorage, { SyncOptionsStorage } from ".../storage/index"
import Title from "../Title.jsx"
import { exportConfig, importConfig } from "./ConfigFileBackup.ts"
import { SettingStyle } from "./SettingStyle.js"

function Settings() {
  const [setting, setSetting] = useState(null)

  // 是否显示 APP
  const [isShowApp, setIsShowApp] = useState(false)
  // 是否总是显示扩展操作按钮
  const [isShowItemOperationAlways, setIsShowItemOperationAlways] = useState(false)
  // 是否总是显示搜索栏
  const [isShowSearchBar, setIsShowSearchBar] = useState(false)
  // 切换分组时，是否执行扩展启用与禁用
  const [isRaiseEnableWhenSwitchGroup, setIsRaiseEnableWhenSwitchGroup] = useState(false)
  // 是否在 Popup 中，展示固定分组中的扩展
  const [isShowFixedExtension, setIsShowFixedExtension] = useState(true)
  // 网格视图下，显示 APP 名称
  const [isShowAppNameInGirdView, setIsShowAppNameInGirdView] = useState(false)
  // 网格视图下，每行显示的扩展个数
  const [columnCountInGirdView, setColumnCountInGirdView] = useState(6)
  // 网格视图下，禁用扩展使用灰色样式
  const [isGaryStyleOfDisableInGridView, setIsGaryStyleOfDisableInGridView] = useState(false)

  const [messageApi, contextHolder] = message.useMessage()

  // 初始化
  useEffect(() => {
    if (setting == null) {
      return
    }

    const showApp = setting.isShowApp ?? false
    setIsShowApp(showApp)
    const showItemOperationAlways = setting.isShowItemOperationAlways ?? false
    setIsShowItemOperationAlways(showItemOperationAlways)
    const showSearchBar = setting.isShowSearchBarDefault ?? false
    setIsShowSearchBar(showSearchBar)
    const raiseEnableWhenSwitchGroup = setting.isRaiseEnableWhenSwitchGroup ?? false
    setIsRaiseEnableWhenSwitchGroup(raiseEnableWhenSwitchGroup)
    const showFixedExtension = setting.isShowFixedExtension ?? true
    setIsShowFixedExtension(showFixedExtension)
    const showAppNameInGridView = setting.isShowAppNameInGirdView ?? false
    setIsShowAppNameInGirdView(showAppNameInGridView)

    // 网格视图下的列数
    let tempColumnInGirdView = Number(setting.columnCountInGirdView)
    if (
      Number.isNaN(tempColumnInGirdView) ||
      tempColumnInGirdView < 6 ||
      tempColumnInGirdView > 10
    ) {
      tempColumnInGirdView = 6
    }
    setColumnCountInGirdView(tempColumnInGirdView)

    // 禁用扩展使用灰色样式
    const grayWhenDisable = setting.isGaryStyleOfDisableInGridView ?? false
    setIsGaryStyleOfDisableInGridView(grayWhenDisable)
  }, [setting])

  // 初始化，从配置中读取设置
  useEffect(() => {
    SyncOptionsStorage.getAll().then((options) => {
      setSetting(options.setting)
    })
  }, [])

  const onSettingChange = (value, settingHandler, optionKey) => {
    settingHandler(value)
    SyncOptionsStorage.getAll().then((options) => {
      // 将新配置，合并到已经存在的 setting中，然后更新到 storage 中
      const setting = fromJS(options.setting).set(optionKey, value).toJS()
      OptionsStorage.set({ setting: setting })
    })
  }

  const onImportConfig = async () => {
    if (await importConfig()) {
      messageApi.open({
        type: "success",
        content: "导入完成"
      })
    } else {
      messageApi.open({
        type: "error",
        content: "导入失败"
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
    OptionsStorage.set({ setting: {} })
    setSetting({})
  }

  return (
    <SettingStyle>
      {contextHolder}
      <Title title="通用设置"></Title>

      <h2>Popup UI 显示偏好设置</h2>

      <div className="container">
        <div className="setting-item">
          <span>
            顶部默认显示搜索框（未设置时点击 🔍 显示）
            <Tooltip placement="top" title="也可以使用快捷键 'F' 打开搜索框">
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

        <div className="setting-item">
          <span>底部显示 APP 类型的扩展</span>
          <Switch
            size="small"
            checked={isShowApp}
            onChange={(value) => onSettingChange(value, setIsShowApp, "isShowApp")}></Switch>
        </div>

        <div className="setting-item">
          <span>列表视图下，始终显示快捷操作按钮（默认 hover 显示）</span>
          <Switch
            size="small"
            checked={isShowItemOperationAlways}
            onChange={(value) =>
              onSettingChange(value, setIsShowItemOperationAlways, "isShowItemOperationAlways")
            }></Switch>
        </div>

        <div className="setting-item">
          <span>
            显示固定分组中的扩展{" "}
            <Tooltip
              placement="top"
              title="固定分组中的扩展，通常为常驻扩展，如果不想在 Popup 列表中展示，可以关闭此选项">
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

        <div className="setting-item">
          <span>
            网格视图下，显示 APP 名称{" "}
            <Tooltip placement="top" title="如果设置了扩展别名，将优先显示别名">
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

        <div className="setting-item">
          <span>网格视图下，扩展显示的列数（{columnCountInGirdView}）</span>
          <Slider
            style={{ width: 100, margin: "0 10px 0 0" }}
            defaultValue={30}
            value={columnCountInGirdView}
            onChange={(value) =>
              onSettingChange(value, setColumnCountInGirdView, "columnCountInGirdView")
            }
            min={6}
            max={10}
            step={1}
          />
        </div>

        <div className="setting-item">
          <span>网格视图下，被禁用的扩展，使用灰色样式</span>
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

      <h2>Popup 功能偏好设置</h2>

      <div className="container">
        <div className="setting-item">
          <span>
            在 Popup 中切换分组时，启用当前分组扩展，禁用其它的扩展{" "}
            <Tooltip
              placement="top"
              title="打开此配置之后，在 Popup 中切换分组时，会禁用掉所有不是固定分组也不是当前分组中的扩展">
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
      </div>

      <div className="import-export-container">
        <Button onClick={onImportConfig}>导入配置</Button>
        <Button onClick={onExportConfig}>导出配置</Button>
        <Button onClick={onRestoreDefault}>恢复默认</Button>
      </div>
    </SettingStyle>
  )
}

export default memo(Settings)
