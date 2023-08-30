import { History } from ".../pages/Background/history/History"
import { RuleHandler } from ".../pages/Background/rule/RuleHandler"
import { LocalOptions } from "../storage/local"

declare interface IExtensionManager {
  LocalOptions: LocalOptions
  Rule: {
    handler: RuleHandler
  }
  Extension: {
    items: chrome.management.ExtensionInfo[]
    update: () => Promise<void>
  }
  History: History
}
