import localforage from "localforage"

const MAX_COUNT = 110
const DELETE_COUNT_ONCE = 10

export class ManualEnableCounter {
  private forage: LocalForage

  constructor() {
    this.forage = localforage.createInstance({
      driver: localforage.INDEXEDDB,
      name: "ExtensionManagerForage",
      version: 1.0,
      storeName: "manual-enable-counter"
    })
  }

  /*
   * 记录一次手动的扩展开启操作
   */
  async count(extId: string) {
    await this.forage.setItem(Date.now().toString(), extId)

    const length = await this.forage.length()
    if (length >= MAX_COUNT) {
      const keys = await this.forage.keys()
      const deleteKeys = keys.slice(0, DELETE_COUNT_ONCE)

      for (const key of deleteKeys) {
        await this.forage.removeItem(key)
      }
    }
  }

  /**
   * 获取排序之后的扩展 ID 列表，按照次数排序，次数多的在前
   */
  async getOrder() {
    let keys = await this.forage.keys()
    keys = keys.slice(0, MAX_COUNT - DELETE_COUNT_ONCE)

    const items = await Promise.all(keys.map((key) => this.forage.getItem<string>(key)))
    const map = new Map()

    for (const item of items) {
      if (!item) {
        continue
      }
      if (map.has(item)) {
        map.set(item, map.get(item) + 1)
      } else {
        map.set(item, 1)
      }
    }

    const result = Array.from(map.entries()).sort((a, b) => b[1] - a[1])
    return result.map(([key]) => key)
  }
}
