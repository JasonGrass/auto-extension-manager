export interface ExtensionRecord extends chrome.management.ExtensionInfo {
  recordUpdateTime: number
  installDate?: number
  updateDate?: number
  state?: "install" | "uninstall"
  /**
   * 图标缓存的来源。
   *
   * manifest：来自 management.ExtensionInfo.icons；fallback：管理 API 没有可读取的
   * 图标时，基于扩展名称生成。该字段只在新版本缓存写入时产生，旧缓存没有该字段。
   */
  iconSource?: "manifest" | "fallback"
  /** 图标缓存格式版本；版本变化时在下次打开前台页面自动重取。 */
  iconCacheVersion?: number
  icon?: string
  // 扩展安装的渠道，通常就是 Chrome / Edge 两个应用商店
  channel?: "Chrome" | "Edge" | "Development"
  needUpdateIcon?: boolean
}
