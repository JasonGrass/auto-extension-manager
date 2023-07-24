import React, { memo, useEffect, useState } from "react"

import { Button, InputNumber, Switch, message } from "antd"
import { fromJS } from "immutable"

import OptionsStorage from ".../storage/index"
import Title from "../Title.jsx"
import { exportConfig, importConfig } from "./ConfigFileBackup.ts"
import { SettingStyle } from "./SettingStyle.js"

function Settings() {
  const [isShowApp, setIsShowApp] = useState(true)
  const [isShowItemOperationAlways, setIsShowItemOperationAlways] =
    useState(false)

  const [messageApi, contextHolder] = message.useMessage()

  useEffect(() => {
    OptionsStorage.getAll().then((options) => {
      const showApp = options.setting?.isShowApp ?? true
      setIsShowApp(showApp)
      const isShowItemOperationAlways =
        options.setting?.isShowItemOperationAlways ?? false
      setIsShowItemOperationAlways(isShowItemOperationAlways)
    })
  }, [])

  const onIsShowAppChange = (checked) => {
    setIsShowApp(checked)
    OptionsStorage.getAll().then((options) => {
      const setting = fromJS(options.setting).set("isShowApp", checked).toJS()
      OptionsStorage.set({ setting: setting })
    })
  }

  const onIsShowItemOperationAlwaysChange = (checked) => {
    setIsShowItemOperationAlways(checked)

    OptionsStorage.getAll().then((options) => {
      const setting = fromJS(options.setting)
        .set("isShowItemOperationAlways", checked)
        .toJS()
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
            onChange={onIsShowAppChange}></Switch>
        </div>
        <div className="setting-item">
          <span>在 Popup 列表中始终显示快捷操作按钮（默认 hover 显示）</span>
          <Switch
            size="small"
            checked={isShowItemOperationAlways}
            onChange={onIsShowItemOperationAlwaysChange}></Switch>
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
