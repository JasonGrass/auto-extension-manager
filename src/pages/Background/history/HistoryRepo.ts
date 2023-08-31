import Dexie from "dexie"

import { HistoryRecord } from "./Record"

const MAX_HISTORY_COUNT = 1100
const DELETE_COUNT_ONCE = 100

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

    const count = await this.history.count()
    if (count > MAX_HISTORY_COUNT) {
      const oldRecords = await this.history.orderBy("timestamp").limit(DELETE_COUNT_ONCE).toArray()
      const keys = oldRecords.map((r) => r.id) as number[]
      await this.history.bulkDelete(keys)
    }
  }

  public async getAll(): Promise<Partial<HistoryRecord>[]> {
    return await this.history.limit(MAX_HISTORY_COUNT - DELETE_COUNT_ONCE).toArray()
  }

  public async clearAll() {
    await this.history.clear()
  }
}
