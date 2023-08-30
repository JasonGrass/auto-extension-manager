import localforage from "localforage"
import OptionsSync from "webext-options-sync"

/**
 * 保存在本地的配置项
 */
export class LocalOptions {
  constructor() {
    localforage.config({
      driver: localforage.INDEXEDDB,
      name: "ExtensionManager",
      version: 1.0,
      storeName: "options"
    })
  }

  /*
   * 迁移旧的配置
   */
  async migrate() {
    let activeSceneId = await this.getActiveSceneId()
    if (activeSceneId !== null) {
      // 已经是新版本了，不必迁移
      return
    }

    const oldOptions = new OptionsSync({
      storageType: "local"
    })
    const all = (await oldOptions.getAll()) as any
    activeSceneId = String(all.scene?.activeId ?? "")
    await this.setActiveSceneId(activeSceneId)
  }

  async getActiveSceneId(): Promise<string | null> {
    const id = await localforage.getItem<string>("activeSceneId")
    if (id === null || id === undefined) {
      return null
    }
    return id
  }

  async setActiveSceneId(id: string) {
    await localforage.setItem("activeSceneId", id)
  }
}
