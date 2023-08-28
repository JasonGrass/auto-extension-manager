import type { IExtensionManager } from ".../types/global"
import logger from ".../utils/logger"

export class HistoryEventHandler {
  constructor(private EM: IExtensionManager) {}

  public onInstalled(info: chrome.management.ExtensionInfo) {}
  public onUninstalled(info: chrome.management.ExtensionInfo) {
    logger().trace("onUninstalled", info)
  }
  public onUninstalled2(id: string) {}
  public onEnabled(info: chrome.management.ExtensionInfo) {}
  public onDisabled(info: chrome.management.ExtensionInfo) {}
}
