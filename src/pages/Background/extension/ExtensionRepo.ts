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
    if (!extension.id) {
      throw new Error("Extension id is required.")
    }
    const old = await this.get(extension.id)
    if (old) {
      await this.forage.setItem(extension.id, { ...old, ...extension })
    } else {
      await this.forage.setItem(extension.id, extension)
    }
  }

  public async remove(id: string): Promise<void> {
    await this.forage.removeItem(id)
  }

  public async getKeys(): Promise<string[]> {
    return await this.forage.keys()
  }
}
