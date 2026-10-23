import type { IExtensionManager } from ".../types/global"
import createHistoryEventListener from "../event/extensionStatusEvent"
import { History } from "./History"
import { HistoryRepo } from "./HistoryRepo"
import { HistoryService } from "./HistoryService"

const createHistory = (EM: IExtensionManager) => {
  const repo = new HistoryRepo()
  const service = new HistoryService(repo)

  const history = new History(EM, service)
  return history
}

export const startHistoryEvents = (EM: IExtensionManager) => {
  createHistoryEventListener(EM, EM.History.EventHandler)

  // 处理缓存事件中，关心的事件
  const args = EM.EventCache.get("onInstalled")
  if (args) {
    void EM.History.EventHandler.onSelfInstalled(args).catch((error) =>
      console.warn("Installation history failed", error)
    )
  }
}

export default createHistory
