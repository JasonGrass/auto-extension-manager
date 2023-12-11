import { LocalOptions } from ".../storage/local"
import { HistoryRepo } from "./HistoryRepo"
import { HistoryRecord } from "./Record"

export class HistoryService {
  private localOptions = new LocalOptions()

  constructor(private repo: HistoryRepo) {}

  /**
   * 添加记录
   * @param record 历史记录
   */
  public async add(record: HistoryRecord) {
    const isClosed = await this.localOptions.getValue("isHistoryRecordFeatureClosed")
    if (isClosed) {
      return
    }
    await this.repo.add(record)
  }

  /**
   * 查询全部的历史记录
   */
  public async queryAll(): Promise<Partial<HistoryRecord>[]> {
    return this.repo.getAll()
  }
}
