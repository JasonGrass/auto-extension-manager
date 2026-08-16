import localforage from "localforage"

import { EXTENSION_ICON_CACHE_VERSION } from ".../utils/extensionIconPolicy"
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
      const icon = extension.icon || old.icon
      await this.forage.setItem(extension.id, { ...old, ...extension, icon: icon })
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

  public async clear(): Promise<void> {
    await this.forage.clear()
  }
}

/**
 * 将当前版本且与已安装扩展版本一致的图标缓存附加到 management API 结果。
 * 旧缓存不会继续污染 UI；后台重建后，下次渲染会自动使用新图标。
 */
export const attachCachedExtensionIcons = async <T extends chrome.management.ExtensionInfo>(
  extensions: T[]
): Promise<Array<T & Pick<ExtensionRecord, "icon" | "iconSource" | "iconCacheVersion">>> => {
  const repo = new ExtensionRepo()
  return await Promise.all(
    extensions.map(async (extension) => {
      const cached = await repo.get(extension.id)
      if (
        !cached?.icon ||
        cached.state === "uninstall" ||
        !cached.iconSource ||
        cached.iconCacheVersion !== EXTENSION_ICON_CACHE_VERSION ||
        cached.version !== extension.version
      ) {
        return extension
      }
      return {
        ...extension,
        icon: cached.icon,
        iconSource: cached.iconSource,
        iconCacheVersion: cached.iconCacheVersion
      }
    })
  )
}
