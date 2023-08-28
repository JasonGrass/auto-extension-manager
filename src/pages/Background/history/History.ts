import { IExtensionManager } from "../../../types/global"
import { HistoryEventHandler } from "./HistoryEventHandler"

export class History {
  public EventHandler: HistoryEventHandler

  constructor(private EM: IExtensionManager) {
    this.EventHandler = new HistoryEventHandler(this.EM)
  }
}
