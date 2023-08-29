import { IExtensionManager } from "../../../types/global"
import { HistoryEventHandler } from "./HistoryEventHandler"
import { HistoryService } from "./HistoryService"

export class History {
  public EventHandler: HistoryEventHandler

  constructor(private EM: IExtensionManager, private service: HistoryService) {
    this.EventHandler = new HistoryEventHandler(this.EM, this.service)
  }
}
