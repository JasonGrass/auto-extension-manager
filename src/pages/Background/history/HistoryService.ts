import { HistoryRepo } from "./HistoryRepo"
import { HistoryRecord } from "./Record"

export class HistoryService {
  constructor(private repo: HistoryRepo) {}

  /**
   * 添加记录
   * @param record 历史记录
   */
  public async add(record: HistoryRecord) {
    await this.repo.add(record)
  }

  /**
   * 查询全部的历史记录
   */
  public async queryAll(): Promise<Partial<HistoryRecord>[]> {
    return this.repo.getAll()
  }
}
