import localforage from "localforage"

import dayjs from "dayjs"

/**
 * 分组快照存储：把当前全部分组配置（含固定/隐藏组）保存为命名快照，
 * 用于清空分组 / AI 重建等不可逆操作前"留一手"。
 *
 * 存储选型与 Popup 的扩展状态快照保持一致（localforage + localStorage 驱动）：
 * 快照属于本机的历史状态，不该进 chrome.storage.sync（挤占配置同步空间）。
 */
export class GroupSnapshotStorage {
  constructor() {
    this.forage = localforage.createInstance({
      driver: localforage.LOCALSTORAGE,
      name: "GroupManagement",
      version: 1.0,
      storeName: "group-snapshot"
    })
  }

  /**
   * 快照列表，新的在前。
   * key 格式为 MMDD.HHmmss，字符串排序即时间排序
   */
  async list() {
    const keys = (await this.forage.keys()) ?? []
    keys.sort()
    keys.reverse()

    const snapshots = []
    for (const key of keys) {
      const data = await this.forage.getItem(key)
      if (data) {
        snapshots.push(data)
      }
    }
    return snapshots
  }

  /**
   * 保存一份分组快照
   *
   * @param {Array} groups getGroups() 的完整分组数组
   * @param {string} [name] 自定义名称，留空用时间
   * @returns {Promise<{key: string, name: string, groups: Array, count: number, extCount: number}>}
   */
  async save(groups, name) {
    const key = dayjs().format("MMDD.HHmmss")
    const snapshot = {
      key,
      name: name && name.trim() ? name.trim() : key,
      groups: groups ?? [],
      count: (groups ?? []).length,
      extCount: (groups ?? []).reduce((sum, group) => sum + (group.extensions?.length ?? 0), 0)
    }
    await this.forage.setItem(key, snapshot)
    return snapshot
  }

  async remove(key) {
    await this.forage.removeItem(key)
  }

  /**
   * 导入快照：按导出文件的原始结构直接入库（key/name 原样保留）。
   * 与 save 的区别：save 生成新时间键，导入要保留来源文件里的键以便去重
   */
  async saveImported(snapshot) {
    await this.forage.setItem(snapshot.key, snapshot)
  }
}

/**
 * 校验导入的快照 JSON 是否为合法的分组快照导出文件。
 * 合法时返回 {name, groups}（可直接交给 save 入库），不合法返回 null。
 * 逐组校验 name/extensions 是因为恢复时会整体替换分组配置，
 * 坏结构会把用户的分组列表搞坏。
 *
 * @param {unknown} data JSON.parse 后的对象
 * @returns {{name: string, groups: Array} | null}
 */
export function validateImportedSnapshot(data) {
  if (!data || typeof data !== "object") {
    return null
  }
  if (data.type !== "group-snapshot") {
    return null
  }
  const groups = data.groups
  if (!Array.isArray(groups) || groups.length === 0) {
    return null
  }
  const valid = groups.every(
    (group) =>
      group &&
      typeof group === "object" &&
      typeof group.id === "string" &&
      typeof group.name === "string" &&
      Array.isArray(group.extensions)
  )
  if (!valid) {
    return null
  }
  return {
    name: String(data.name ?? "").slice(0, 30) || "imported",
    groups
  }
}
