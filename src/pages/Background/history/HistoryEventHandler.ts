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

  /*
   * 执行规则时自动启用了扩展
   */
  public onAutoEnabled(info: chrome.management.ExtensionInfo, rule: ruleV2.IRuleConfig) {
    console.log("onAutoEnabled", info, rule)
  }
  /*
   * 执行规则时自动禁用了扩展
   */
  public onAutoDisabled(info: chrome.management.ExtensionInfo, rule: ruleV2.IRuleConfig) {
    console.log("onAutoDisabled", info, rule)
  }

  /**
   * 切换分组时，自动启用了扩展
   */
  public onManualEnabled(infos: chrome.management.ExtensionInfo[], group: config.IGroup) {
    console.log("onManualEnabled", infos, group)
  }

  /**
   * 切换分组时，自动禁用了扩展
   */
  public onManualDisabled(infos: chrome.management.ExtensionInfo[], group: config.IGroup) {
    console.log("onManualDisabled", infos, group)
  }
}
