import React, { memo, useEffect, useState } from "react"

import { InfoCircleOutlined, QuestionCircleOutlined } from "@ant-design/icons"
import { Switch, Tooltip } from "antd"

import { getLang } from ".../utils/utils"

const FunctionSetting = memo(({ setting, onSettingChange }) => {
  // 启用当前分组时，是否禁用当前分组和固定分组之外的所有扩展
  const [isEnableCurrentGroupAndDisableOthers, setIsEnableCurrentGroupAndDisableOthers] =
    useState(false)
  // Home 按钮的链接
  const [isHomeLinkToStore, setIsHomeLinkToStore] = useState(false)

  useEffect(() => {
    // 功能偏好
    const enableCurrentGroupAndDisableOthers = setting.isEnableCurrentGroupAndDisableOthers ?? false
    setIsEnableCurrentGroupAndDisableOthers(enableCurrentGroupAndDisableOthers)
    const homeLinkToStore = setting.isHomeLinkToStore ?? false
    setIsHomeLinkToStore(homeLinkToStore)
  }, [setting])

  const onHomeLinkHelpClick = () => {
    chrome.tabs.create({ url: "https://ext.jgrass.cc/docs/setting" })
  }

  return (
    <div>
      {/* 启用当前分组并禁用其他全部扩展 */}
      <div className="setting-item">
        <span>
          {getLang("setting_func_enable_group_exclusively")}
          <Tooltip placement="top" title={getLang("setting_func_enable_group_exclusively_tip")}>
            <QuestionCircleOutlined />
          </Tooltip>{" "}
        </span>
        <Switch
          size="small"
          checked={isEnableCurrentGroupAndDisableOthers}
          onChange={(value) =>
            onSettingChange(
              value,
              setIsEnableCurrentGroupAndDisableOthers,
              "isEnableCurrentGroupAndDisableOthers"
            )
          }></Switch>
      </div>
      {/* HOME 按钮点击的链接位置 */}
      <div className="setting-item">
        <span>
          {getLang("setting_func_home_link_store")}
          <InfoCircleOutlined onClick={onHomeLinkHelpClick} className="help-info-icon" />
        </span>
        <Switch
          size="small"
          checked={isHomeLinkToStore}
          onChange={(value) =>
            onSettingChange(value, setIsHomeLinkToStore, "isHomeLinkToStore")
          }></Switch>
      </div>
    </div>
  )
})

export default FunctionSetting
