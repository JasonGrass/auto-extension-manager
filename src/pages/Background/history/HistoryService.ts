import { HistoryRepo } from "./HistoryRepo"
import { HistoryRecord } from "./Record"

export class HistoryService {
  constructor(private repo: HistoryRepo) {}

  public async add(record: HistoryRecord) {
    this.repo.add(record)
  }
}
