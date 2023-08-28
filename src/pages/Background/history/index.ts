import type { IExtensionManager } from ".../types/global"
import createHistoryEventListener from "../event/extensionStatusEvent"
import { History } from "./History"

const createHistory = async (EM: IExtensionManager) => {
  const history = new History(EM)

  createHistoryEventListener(EM, history.EventHandler)

  return history
}

export default createHistory
