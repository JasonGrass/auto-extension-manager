import React, { memo, useEffect, useState } from "react"

import { QuestionCircleOutlined } from "@ant-design/icons"
import { Button, Popconfirm, Radio, Slider, Switch, Tooltip, message } from "antd"

import { getLang } from ".../utils/utils"

const FunctionSetting = memo(({ setting, onSettingChange }) => {
  // 切换分组时，是否执行扩展启用与禁用
  const [isRaiseEnableWhenSwitchGroup, setIsRaiseEnableWhenSwitchGroup] = useState(false)
  // 分组切换时，是否支持多选
  const [isSupportMultiSelectGroup, setIsSupportMultiSelectGroup] = useState(false)

  useEffect(() => {
    // 功能偏好
    const raiseEnableWhenSwitchGroup = setting.isRaiseEnableWhenSwitchGroup ?? false
    setIsRaiseEnableWhenSwitchGroup(raiseEnableWhenSwitchGroup)
    const supportMultiSelectGroup = setting.isSupportMultiSelectGroup ?? false
    setIsSupportMultiSelectGroup(supportMultiSelectGroup)
  }, [setting])

  return (
    <div>
      {/* 切换分组时，启用当前分组扩展，禁用其它的扩展 */}
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
            onSettingChange(value, setIsRaiseEnableWhenSwitchGroup, "isRaiseEnableWhenSwitchGroup")
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
  )
})

export default FunctionSetting
