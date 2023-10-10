export interface ExtensionRecord extends chrome.management.ExtensionInfo {
  recordUpdateTime: number
  installDate?: number
  updateDate?: number
  state?: "install" | "uninstall"
  icon?: string
  // 扩展安装的渠道，通常就是 Chrome / Edge 两个应用商店
  channel?: "Chrome" | "Edge" | "Development"
  needUpdateIcon?: boolean
}
