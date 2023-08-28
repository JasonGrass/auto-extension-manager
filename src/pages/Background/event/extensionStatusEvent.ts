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
}

export default createHistoryEventListener
