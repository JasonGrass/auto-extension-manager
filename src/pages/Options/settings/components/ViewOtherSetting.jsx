import React, { memo, useEffect, useState } from "react"

import { QuestionCircleOutlined } from "@ant-design/icons"
import { Button, Popconfirm, Radio, Slider, Switch, Tooltip, message } from "antd"

import { getLang } from ".../utils/utils"

const ViewOtherSetting = memo(({ setting, onSettingChange }) => {
  // Popup 中，按照频率进行排序
  const [isSortByFrequency, setIsSortByFrequency] = useState(false)
  // Popup 暗色模式
  const [darkMode, setDarkMode] = useState("system")
  // Popup 缩放比例
  const [zoomRatio, setZoomRatio] = useState(100)

  useEffect(() => {
    const sortByFrequency = setting.isSortByFrequency ?? false
    setIsSortByFrequency(sortByFrequency)
    const initDarkMode = setting.darkMode ?? "system"
    setDarkMode(initDarkMode)
    const ratio = setting.zoomRatio ?? 100
    setZoomRatio(ratio)
  }, [setting])

  return (
    <div>
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

      {/* 缩放比例 */}
      <div className="setting-item">
        <span>{getLang("setting_popup_scale_title")}</span>
        <Slider
          style={{ width: 100, margin: "0 10px 0 0" }}
          defaultValue={100}
          value={zoomRatio}
          onChange={(value) => onSettingChange(value, setZoomRatio, "zoomRatio")}
          min={10}
          max={100}
          step={1}
        />
      </div>
    </div>
  )
})

export default ViewOtherSetting
