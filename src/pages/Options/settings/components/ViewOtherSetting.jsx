import React, { memo, useEffect, useState } from "react"

import { Segmented, Slider } from "antd"

import { getLang } from ".../utils/utils"

const ViewOtherSetting = memo(({ setting, themeMode, onSettingChange }) => {
  // Popup 缩放比例
  const [zoomRatio, setZoomRatio] = useState(100)

  useEffect(() => {
    const ratio = setting.zoomRatio ?? 100
    setZoomRatio(ratio)
  }, [setting])

  return (
    <div>
      {/* 暗色模式 */}
      <div className="setting-item">
        <span>{getLang("setting_dark_mode_title")}</span>
        <Segmented
          aria-label={getLang("setting_dark_mode_title")}
          options={["light", "dark", "system"].map((value) => ({
            value,
            label: getLang(`setting_dark_mode_${value}`)
          }))}
          onChange={(value) => onSettingChange(value, null, "darkMode")}
          value={themeMode}
        />
      </div>

      {/* 缩放比例 */}
      <div className="setting-item">
        <span>{getLang("setting_popup_scale_title")}</span>
        <div className="setting-slider">
          <Slider
            ariaLabelForHandle={getLang("setting_popup_scale_title")}
            value={zoomRatio}
            onChange={(value) => onSettingChange(value, setZoomRatio, "zoomRatio")}
            min={10}
            max={100}
            step={1}
          />
          <output>{zoomRatio}%</output>
        </div>
      </div>
    </div>
  )
})

export default ViewOtherSetting
