export interface ExtensionRecord extends chrome.management.ExtensionInfo {
  recordUpdateTime: number
  installDate?: number
  updateDate?: number
  state?: "install" | "uninstall"
  icon?: string
}
