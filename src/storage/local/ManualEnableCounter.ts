import localforage from "localforage"

// 最多记录的条数
const MAX_COUNT = 110
// 如果超过最多记录的条数，则删除最后面的 N 条
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

    if (keys.length === 0) {
      return []
    }

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

  /**
   * 获取最近手动启用的扩展的 ID 列表，按照时间排序，最新的在最前
   */
  async getRecentlyEnableIds() {
    let keys = await this.forage.keys()

    if (keys.length === 0) {
      return []
    }

    const items = await Promise.all(
      keys.map(async (key) => {
        const id = await this.forage.getItem<string>(key)
        return {
          key,
          id
        }
      })
    )

    // 第一步：使用 Map 记录每个 id 的最大 key
    const maxKeyMap = new Map()

    items.forEach((item) => {
      const currentId = item.id
      const currentKey = Number(item.key)

      if (!maxKeyMap.has(currentId) || currentKey > maxKeyMap.get(currentId)) {
        maxKeyMap.set(currentId, currentKey)
      }
    })

    // 第二步：将结果转换为数组，并按 key 排序
    const resultArray = Array.from(maxKeyMap, ([id, key]) => ({ id, key }))
    resultArray.sort((a, b) => b.key - a.key)

    // 第三步：提取出排序后的 id 列表
    const sortedIdList = resultArray.map((item) => item.id)

    return sortedIdList
  }
}
