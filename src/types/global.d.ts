import { History } from ".../pages/Background/history/History"
import { RuleHandler } from ".../pages/Background/rule/RuleHandler"

declare interface IExtensionManager {
  Rule: {
    handler: RuleHandler
  }
  Extension: {
    items: chrome.management.ExtensionInfo[]
    update: () => Promise<void>
  }
  History: History
}
