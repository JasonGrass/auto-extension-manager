import { useEffect, useState } from "react"

/**
 * 是否显示 app 类型扩展的控制，
 * 显示 app 类型扩展的条件：通用设置中打开了配置 && 位于非特定分组
 */
export const useShowAppController = (options) => {
  // 是否显示 APP 类型的扩展
  const [isSettingShowAppExtension, setIsSettingShowAppExtension] = useState(false)
  const [isShowAppExtension, setIsShowAppExtension] = useState(false)

  useEffect(() => {
    const showApp = options.setting?.isShowApp ?? false
    setIsSettingShowAppExtension(showApp)
    setIsShowAppExtension(showApp)
  }, [options])

  const setShowAppExtension = (value) => {
    setIsShowAppExtension(isSettingShowAppExtension && value)
  }

  return [isShowAppExtension, setShowAppExtension]
}
