import localforage from "localforage"

import { ExtensionRecord } from "./ExtensionRecord"

/**
 * 本地缓存的 Extension 信息
 */
export class ExtensionRepo {
  private forage: LocalForage

  constructor() {
    this.forage = localforage.createInstance({
      driver: localforage.INDEXEDDB,
      name: "ExtensionManagerForage",
      version: 1.0,
      storeName: "extensions"
    })
  }

  public async get(id: string): Promise<ExtensionRecord | null> {
    return await this.forage.getItem(id)
  }

  public async set(extension: ExtensionRecord): Promise<void> {
    await this.forage.setItem(extension.id, extension)
  }

  public async remove(id: string): Promise<void> {
    await this.forage.removeItem(id)
  }

  public async getKeys(): Promise<string[]> {
    return await this.forage.keys()
  }
}
