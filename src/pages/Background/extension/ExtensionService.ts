import chromeP from "webext-polyfill-kinda"

import { IExtensionManager } from ".../types/global"
import { ExtensionRecord } from "./ExtensionRecord"
import { ExtensionRepo } from "./ExtensionRepo"

export class ExtensionService {
  constructor(private EM: IExtensionManager, private repo: ExtensionRepo) {}

  /**
   * 初始化本地缓存的 Extension 信息
   */
  public async initial() {
    const lastTime = await this.EM.LocalOptions.getLastInitialTime()
    if (Date.now() - lastTime < 1000 * 60 * 60 * 24) {
      // 24 小时只批量初始化一次，其它的，靠主动更新
      return
    }
    await this.EM.LocalOptions.setLastInitialTime(Date.now())
    const list = await chromeP.management.getAll()
    const now = Date.now()
    for (const item of list) {
      // const iconDataUrl = await getIconDataUrl(item)
      // 无法在 background 下获取 icon 数据
      const ext = { ...item, icon: "", recordUpdateTime: now }
      this.repo.set(ext)
    }
  }

  public async getExtension(id: string): Promise<ExtensionRecord | null> {
    return this.repo.get(id)
  }

  public async setExtension(extension: ExtensionRecord): Promise<void> {
    await this.repo.set(extension)
  }
}
