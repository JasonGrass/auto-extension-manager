import React, { memo, useEffect, useState } from "react"

import { QuestionCircleOutlined } from "@ant-design/icons"
import { Button, InputNumber, Switch, Tooltip, message } from "antd"
import { fromJS } from "immutable"

import OptionsStorage, { SyncOptionsStorage } from ".../storage/index"
import Title from "../Title.jsx"
import { exportConfig, importConfig } from "./ConfigFileBackup.ts"
import { SettingStyle } from "./SettingStyle.js"

function Settings() {
  // 是否显示 APP
  const [isShowApp, setIsShowApp] = useState(true)
  // 是否总是显示扩展操作按钮
  const [isShowItemOperationAlways, setIsShowItemOperationAlways] = useState(false)
  // 是否总是显示搜索栏
  const [isShowSearchBar, setIsShowSearchBar] = useState(false)
  // 切换分组时，是否执行扩展启用与禁用
  const [isRaiseEnableWhenSwitchGroup, setIsRaiseEnableWhenSwitchGroup] = useState(false)
  // 是否在 Popup 中，展示固定分组中的扩展
  const [isShowFixedExtension, setIsShowFixedExtension] = useState(true)

  const [messageApi, contextHolder] = message.useMessage()

  useEffect(() => {
    // 根据保存的配置，初始化设置的显示
    SyncOptionsStorage.getAll().then((options) => {
      const showApp = options.setting.isShowApp ?? true
      setIsShowApp(showApp)
      const showItemOperationAlways = options.setting.isShowItemOperationAlways ?? false
      setIsShowItemOperationAlways(showItemOperationAlways)
      const showSearchBar = options.setting.isShowSearchBarDefault ?? false
      setIsShowSearchBar(showSearchBar)
      const raiseEnableWhenSwitchGroup = options.setting.isRaiseEnableWhenSwitchGroup ?? false
      setIsRaiseEnableWhenSwitchGroup(raiseEnableWhenSwitchGroup)
      const showFixedExtension = options.setting.isShowFixedExtension ?? true
      setIsShowFixedExtension(showFixedExtension)
    })
  }, [])

  const onSettingChange = (value, settingHandler, optionKey) => {
    settingHandler(value)
    SyncOptionsStorage.getAll().then((options) => {
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

  return (
    <SettingStyle>
      {contextHolder}
      <Title title="通用设置"></Title>

      <div className="container">
        <div className="setting-item">
          <span>在 Popup 底部中显示 APP 类型的扩展</span>
          <Switch
            size="small"
            checked={isShowApp}
            onChange={(value) => onSettingChange(value, setIsShowApp, "isShowApp")}></Switch>
        </div>
        <div className="setting-item">
          <span>在 Popup 列表中始终显示快捷操作按钮（默认 hover 显示）</span>
          <Switch
            size="small"
            checked={isShowItemOperationAlways}
            onChange={(value) =>
              onSettingChange(value, setIsShowItemOperationAlways, "isShowItemOperationAlways")
            }></Switch>
        </div>
        <div className="setting-item">
          <span>在 Popup 顶部始终显示搜索框（默认点击 🔍 显示）</span>
          <Switch
            size="small"
            checked={isShowSearchBar}
            onChange={(value) =>
              onSettingChange(value, setIsShowSearchBar, "isShowSearchBarDefault")
            }></Switch>
        </div>
        <div className="setting-item">
          <span>
            在 Popup 中切换分组时，仅开启固定分组和当前分组中的扩展{" "}
            <Tooltip
              placement="top"
              title="启用之后，在 Popup 中执行切换分组的动作，会禁用掉所有非固定分组和当前分组中的扩展">
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
        <div className="setting-item">
          <span>
            在 Popup 中展示固定分组中的扩展{" "}
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
        <div className="setting-width setting-item">
          <span>Popup 弹窗宽度</span>
          <InputNumber size="small" min={300} max={800} defaultValue={400} />
        </div>
      </div>

      <div className="import-export-container">
        <Button onClick={onImportConfig}>导入配置</Button>
        <Button onClick={onExportConfig}>导出配置</Button>
      </div>
    </SettingStyle>
  )
}

export default memo(Settings)
