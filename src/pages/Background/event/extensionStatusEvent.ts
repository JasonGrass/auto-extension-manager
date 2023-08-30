import { IExtensionManager } from "../../../types/global"
import { HistoryEventHandler } from "../history/HistoryEventHandler"

const createHistoryEventListener = (EM: IExtensionManager, eventHandler: HistoryEventHandler) => {
  // 扩展被安装或者更新
  chrome.management.onInstalled.addListener((info) => {
    eventHandler.onInstalled(info)
  })

  // 扩展被卸载
  chrome.management.onUninstalled.addListener((id) => {
    const item = EM.Extension.items.find((ext) => ext.id === id)
    if (item) {
      eventHandler.onUninstalled(item)
    } else {
      eventHandler.onUninstalled2(id)
    }
  })

  // 启用
  chrome.management.onEnabled.addListener((info) => {
    eventHandler.onEnabled(info)
  })

  // 禁用
  chrome.management.onDisabled.addListener((info) => {
    eventHandler.onDisabled(info)
  })

  // 仅对当前扩展生效
  // Fired when the extension is first installed, when the extension is updated to a new version, and when Chrome is updated to a new version.
  chrome.runtime.onInstalled.addListener((info) => {
    eventHandler.onSelfInstalled(info)
  })
}

export default createHistoryEventListener
