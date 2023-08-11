import React, { memo, useEffect, useState } from "react"

import { Button, InputNumber, Switch, message } from "antd"
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

  const [messageApi, contextHolder] = message.useMessage()

  useEffect(() => {
    // 根据保存的配置，初始化设置的显示
    OptionsStorage.getAll().then((options) => {
      const showApp = options.setting?.isShowApp ?? true
      setIsShowApp(showApp)
      const isShowItemOperationAlways = options.setting?.isShowItemOperationAlways ?? false
      setIsShowItemOperationAlways(isShowItemOperationAlways)
      const isShowSearchBar = options.setting?.isShowSearchBarDefault ?? false
      setIsShowSearchBar(isShowSearchBar)
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
