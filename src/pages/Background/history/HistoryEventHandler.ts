import type { IExtensionManager } from ".../types/global"
import logger from ".../utils/logger"

export class HistoryEventHandler {
  private _output: HistoryEventRaiser = new HistoryEventRaiser(this.EM)

  private _enabledEventFilter: ReduplicativeEventFilter = new ReduplicativeEventFilter(
    this._output,
    "enabled"
  )
  private _disabledEventFilter: ReduplicativeEventFilter = new ReduplicativeEventFilter(
    this._output,
    "disabled"
  )

  constructor(private EM: IExtensionManager) {}

  public onInstalled(info: chrome.management.ExtensionInfo) {
    this._output.onInstalled(info)
  }

  public onUninstalled(info: chrome.management.ExtensionInfo) {
    this._output.onUninstalled(info)
  }

  public onUninstalled2(id: string) {
    this._output.onUninstalled2(id)
  }

  public onEnabled(info: chrome.management.ExtensionInfo) {
    this._enabledEventFilter.onBrowserEvent(info)
  }

  public onDisabled(info: chrome.management.ExtensionInfo) {
    this._disabledEventFilter.onBrowserEvent(info)
  }

  /*
   * 执行规则时自动启用了扩展
   */
  public onAutoEnabled(info: chrome.management.ExtensionInfo, rule: ruleV2.IRuleConfig) {
    this._enabledEventFilter.onAutoRuleEvent(info, rule)
  }

  /*
   * 执行规则时自动禁用了扩展
   */
  public onAutoDisabled(info: chrome.management.ExtensionInfo, rule: ruleV2.IRuleConfig) {
    this._disabledEventFilter.onAutoRuleEvent(info, rule)
  }

  /**
   * 切换分组时，自动启用了扩展
   */
  public onManualEnabled(infos: chrome.management.ExtensionInfo[], group: config.IGroup) {
    this._enabledEventFilter.onManualEvent(infos, group)
  }

  /**
   * 切换分组时，自动禁用了扩展
   */
  public onManualDisabled(infos: chrome.management.ExtensionInfo[], group: config.IGroup) {
    this._disabledEventFilter.onManualEvent(infos, group)
  }
}

export class HistoryEventRaiser {
  constructor(private EM: IExtensionManager) {}

  public onInstalled(info: chrome.management.ExtensionInfo) {}

  public onUninstalled(info: chrome.management.ExtensionInfo) {
    logger().trace("onUninstalled", info)
  }

  public onUninstalled2(id: string) {}

  public onEnabled(info: chrome.management.ExtensionInfo) {
    logger().trace("onEnabled", info)
  }

  public onDisabled(info: chrome.management.ExtensionInfo) {
    logger().trace("onDisabled", info)
  }

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

/**
 * 重复事件过滤，对于扩展本身的造成的扩展禁用与启用，优先使用扩展管理器本身的事件，过滤掉浏览器的默认事件
 */
class ReduplicativeEventFilter {
  constructor(private output: HistoryEventRaiser, private eventType: "enabled" | "disabled") {}

  private _threshold: number = 500

  private _browserEventRecord: Map<string, number> = new Map()
  private _autoEventRecord: Map<string, number> = new Map()
  private _manualEventRecord: Map<string, number> = new Map()

  public onBrowserEvent(info: chrome.management.ExtensionInfo) {
    this._browserEventRecord.set(info.id, Date.now())

    setTimeout(() => {
      if (this.isAutoRuleEventHappen(info.id) || this.isManualRuleEventHappen(info.id)) {
        // 这里是浏览器默认的事件触发，延后 threshold 毫秒判断，如果已经触发了业务自定义的事件，则不再触发浏览器默认的事件，避免一个扩展被开启/禁用，触发两次事件
        this.clean()
        return
      }
      if (this.eventType === "enabled") {
        this.output.onEnabled(info)
      } else {
        this.output.onDisabled(info)
      }
      this.clean()
    }, this._threshold)
  }

  public onAutoRuleEvent(info: chrome.management.ExtensionInfo, rule: ruleV2.IRuleConfig) {
    this._autoEventRecord.set(info.id, Date.now())

    if (this.eventType === "enabled") {
      this.output.onAutoEnabled(info, rule)
    } else {
      this.output.onAutoDisabled(info, rule)
    }
  }

  public onManualEvent(infos: chrome.management.ExtensionInfo[], group: config.IGroup) {
    const now = Date.now()
    for (const info of infos) {
      this._manualEventRecord.set(info.id, now)
    }

    if (this.eventType === "enabled") {
      this.output.onManualEnabled(infos, group)
    } else {
      this.output.onManualDisabled(infos, group)
    }
  }

  private isAutoRuleEventHappen(id: string) {
    const autoEventTime = this._autoEventRecord.get(id)
    if (!autoEventTime) {
      return false
    }
    const browserEventTime = this._browserEventRecord.get(id)
    if (!browserEventTime) {
      return false
    }

    return Math.abs(autoEventTime - browserEventTime) < this._threshold
  }

  private isManualRuleEventHappen(id: string) {
    const manualEventTime = this._manualEventRecord.get(id)
    if (!manualEventTime) {
      return false
    }
    const browserEventTime = this._browserEventRecord.get(id)
    if (!browserEventTime) {
      return false
    }

    return Math.abs(manualEventTime - browserEventTime) < this._threshold
  }

  private clean() {
    const now = Date.now()
    const deleteThreshold = this._threshold * 10
    for (const record of this._browserEventRecord) {
      if (now - record[1] > deleteThreshold) {
        this._browserEventRecord.delete(record[0])
      }
    }
    for (const record of this._manualEventRecord) {
      if (now - record[1] > deleteThreshold) {
        this._manualEventRecord.delete(record[0])
      }
    }
    for (const record of this._autoEventRecord) {
      if (now - record[1] > deleteThreshold) {
        this._autoEventRecord.delete(record[0])
      }
    }
  }
}
