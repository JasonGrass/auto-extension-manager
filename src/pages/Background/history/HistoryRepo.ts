import Dexie from "dexie"

import { HistoryRecord } from "./Record"

export class HistoryRepo extends Dexie {
  private history!: Dexie.Table<Partial<HistoryRecord>, number>

  constructor() {
    super("ExtensionManager")
    this.version(0.1).stores({
      history: "++id, timestamp, event, extensionId, icon, name, version, remark, ruleId, groupId"
    })
  }

  public async add(record: Partial<HistoryRecord>) {
    record.id = undefined // 自增 ID，这里设置成 undefined，数据库自行赋值
    await this.history.add(record)
  }

  public async getAll(): Promise<Partial<HistoryRecord>[]> {
    return await this.history.toArray()
  }

  public async clearAll() {
    await this.history.clear()
  }
}
