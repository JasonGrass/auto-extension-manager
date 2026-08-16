import localforage from "localforage"
import OptionsSync from "webext-options-sync"

import { normalizeActiveSceneIds, resolveStoredActiveSceneIds } from "./activeSceneState"

/**
 * 保存在本地的配置项
 */
export class LocalOptions {
  private forage: LocalForage

  constructor() {
    this.forage = localforage.createInstance({
      driver: localforage.INDEXEDDB,
      name: "ExtensionManagerForage",
      version: 1.0,
      storeName: "options"
    })
  }

  /*
   * 迁移旧的配置
   */
  async migrate() {
    const activeSceneIds = await this.forage.getItem<unknown>("activeSceneIds")
    if (Array.isArray(activeSceneIds)) {
      // Normalize existing collection data and keep the legacy key available for rollback.
      await this.setActiveSceneIds(activeSceneIds)
      return
    }

    const localLegacyId = await this.forage.getItem<unknown>("activeSceneId")
    const oldOptions = new OptionsSync({
      storageType: "local"
    })
    const all = (await oldOptions.getAll()) as { scene?: { activeId?: unknown } }
    const optionsSyncLegacyId = String(all.scene?.activeId ?? "")

    // Prefer the latest IndexedDB single-scene key, then fall back to the oldest OptionsSync data.
    // An existing empty IndexedDB value means the user explicitly cancelled all scenes.
    const legacyId = typeof localLegacyId === "string" ? localLegacyId : optionsSyncLegacyId
    await this.setActiveSceneIds(resolveStoredActiveSceneIds(undefined, legacyId))
  }

  /** @deprecated Use getActiveSceneIds for multi-scene aware code. */
  async getActiveSceneId(): Promise<string | null> {
    const ids = await this.getActiveSceneIds()
    return ids.length > 0 ? ids[ids.length - 1] : null
  }

  /** @deprecated Use setActiveSceneIds for multi-scene aware code. */
  async setActiveSceneId(id: string) {
    await this.setActiveSceneIds(id ? [id] : [])
  }

  async getActiveSceneIds(): Promise<string[]> {
    const [value, legacyId] = await Promise.all([
      this.forage.getItem<unknown>("activeSceneIds"),
      this.forage.getItem<unknown>("activeSceneId")
    ])
    return resolveStoredActiveSceneIds(value, legacyId)
  }

  async setActiveSceneIds(ids: unknown) {
    const normalized = normalizeActiveSceneIds(ids)
    await this.forage.setItem("activeSceneIds", normalized)

    // Dual-write the most recently activated scene so a version rollback still has usable state.
    const legacyId = normalized.length > 0 ? normalized[normalized.length - 1] : ""
    await this.forage.setItem("activeSceneId", legacyId)
  }

  async getActiveGroupId(): Promise<string | null> {
    const id = await this.forage.getItem<string>("activeGroupId")
    if (id === null || id === undefined) {
      return null
    }
    return id
  }

  async setActiveGroupId(id: string) {
    await this.forage.setItem("activeGroupId", id ?? "")
  }

  async getValue<T>(key: string): Promise<T | null> {
    const value = await this.forage.getItem<T>(key)
    if (value === null || value === undefined) {
      return null
    }
    return value
  }

  async setValue<T>(key: string, value: T) {
    await this.forage.setItem<T>(key, value)
  }

  async getLastInitialTime(): Promise<number> {
    const time = await this.forage.getItem<number>("lastInitialExtensionTime")
    return time ?? 0
  }

  async setLastInitialTime(time: number) {
    await this.forage.setItem("lastInitialExtensionTime", time)
  }

  async getNeedBuildExtensionIcon(): Promise<boolean> {
    const str = await this.forage.getItem<string>("isNeedBuildExtensionIcon")
    if (str === "true") {
      return true
    } else if (str === "false") {
      return false
    }
    return true
  }

  async setNeedBuildExtensionIcon(isNeedBuildExtensionIcon: boolean) {
    await this.forage.setItem(
      "isNeedBuildExtensionIcon",
      isNeedBuildExtensionIcon.toString().toLowerCase()
    )
  }
}
