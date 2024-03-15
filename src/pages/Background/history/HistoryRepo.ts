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

  /**
   * 获取所有的历史纪录。后续性能优化点：支持分页获取
   */
  public async getAll(): Promise<Partial<HistoryRecord>[]> {
    const all = await this.history.toArray()
    if (all.length <= MAX_HISTORY_COUNT - DELETE_COUNT_ONCE) {
      return all
    }
    const shouldRemoveCount = all.length - (MAX_HISTORY_COUNT - DELETE_COUNT_ONCE)
    all.splice(0, shouldRemoveCount)
    return all
  }

  public async clearAll() {
    await this.history.clear()
  }
}
