import React, { memo, useEffect, useState } from "react"

import { QuestionCircleOutlined } from "@ant-design/icons"
import { Button, Popconfirm, Radio, Slider, Switch, Tooltip, message } from "antd"

import { getLang } from ".../utils/utils"

const ViewOtherSetting = memo(({ setting, onSettingChange }) => {
  // Popup 中，按照频率进行排序
  const [isSortByFrequency, setIsSortByFrequency] = useState(false)
  // Popup 暗色模式
  const [darkMode, setDarkMode] = useState("system")

  useEffect(() => {
    const sortByFrequency = setting.isSortByFrequency ?? false
    setIsSortByFrequency(sortByFrequency)
    const initDarkMode = setting.darkMode ?? "system"
    setDarkMode(initDarkMode)
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
    </div>
  )
})

export default ViewOtherSetting
