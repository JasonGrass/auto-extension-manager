import type { IExtensionManager } from ".../types/global"
import createHistoryEventListener from "../event/extensionStatusEvent"
import { History } from "./History"
import { HistoryRepo } from "./HistoryRepo"
import { HistoryService } from "./HistoryService"

const createHistory = async (EM: IExtensionManager) => {
  const repo = new HistoryRepo()
  const service = new HistoryService(repo)

  const history = new History(EM, service)

  createHistoryEventListener(EM, history.EventHandler)

  // 处理缓存事件中，关心的事件
  const args = EM.EventCache.get("onInstalled")
  if (args) {
    history.EventHandler.onSelfInstalled(args)
  }

  return history
}

export default createHistory
