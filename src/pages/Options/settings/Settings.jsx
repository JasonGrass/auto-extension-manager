import React, { memo, useEffect, useState } from "react"

import { InputNumber, Switch } from "antd"

import OptionsStorage from ".../storage/index"
import Title from "../Title.jsx"
import { SettingStyle } from "./SettingStyle"

function Settings() {
  const [isShowApp, setIsShowApp] = useState(true)

  useEffect(() => {
    OptionsStorage.getAll().then((options) => {
      const showApp = options.setting?.isShowApp ?? true
      setIsShowApp(showApp)
    })
  }, [])

  const onIsShowAppChange = (checked) => {
    setIsShowApp(checked)
    OptionsStorage.set({ setting: { isShowApp: checked } })
  }

  return (
    <SettingStyle>
      <Title title="通用设置"></Title>

      <div className="container">
        <div className="setting-app setting-item">
          <span>在 Popup 底部中显示 APP 类型的扩展</span>
          <Switch
            size="small"
            checked={isShowApp}
            onChange={onIsShowAppChange}></Switch>
        </div>
        <div className="setting-width setting-item">
          <span>Popup 弹窗宽度</span>
          <InputNumber size="small" min={300} max={800} defaultValue={400} />
        </div>
      </div>
    </SettingStyle>
  )
}

export default memo(Settings)
