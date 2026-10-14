/**
 * 临时快照管理 — 一键关闭时自动保存，一键打开时自动恢复。
 *
 * 与上游 MoreOperationDropdown 的命名快照完全独立：
 * - 命名快照用 localforage (localStorage)，用户主动保存/命名/恢复
 * - 临时快照用 chrome.storage.local，固定 key，一键关闭时自动覆盖，恢复后自动清除
 */

const SNAPSHOT_KEY = "__auto_close_snapshot__"

/**
 * 保存当前所有扩展的 enabled 状态快照。
 * 调用时机：用户点击"一键关闭"时，先保存再禁用。
 */
export async function saveAutoSnapshot() {
  const allExtensions = await chrome.management.getAll()
  const self = await chrome.management.getSelf()

  const states = allExtensions
    .filter((ext) => ext.type === "extension" && ext.id !== self.id)
    .map((ext) => ({ id: ext.id, enabled: ext.enabled }))

  const snapshot = {
    states,
    timestamp: Date.now(),
  }

  await chrome.storage.local.set({ [SNAPSHOT_KEY]: snapshot })
  return snapshot
}

/**
 * 读取临时快照。
 * @returns {Promise<{states: {id: string, enabled: boolean}[], timestamp: number} | null>}
 */
export async function loadAutoSnapshot() {
  const result = await chrome.storage.local.get(SNAPSHOT_KEY)
  return result[SNAPSHOT_KEY] ?? null
}

/**
 * 清除临时快照。
 * 调用时机：恢复完成后。
 */
export async function clearAutoSnapshot() {
  await chrome.storage.local.remove(SNAPSHOT_KEY)
}

/**
 * 检测当前扩展状态与快照中记录的状态是否有差异（用户在关闭后手动改了扩展）。
 * @returns {Promise<{modifiedCount: number, snapshotExists: boolean}>}
 */
export async function detectManualModifications() {
  const snapshot = await loadAutoSnapshot()
  if (!snapshot) {
    return { modifiedCount: 0, snapshotExists: false }
  }

  const allExtensions = await chrome.management.getAll()
  const currentMap = new Map(
    allExtensions.filter((e) => e.type === "extension").map((e) => [e.id, e.enabled])
  )

  let modifiedCount = 0
  for (const entry of snapshot.states) {
    const current = currentMap.get(entry.id)
    if (current !== undefined && current !== false) {
      // 快照保存后所有扩展应该都是 disabled
      // 如果现在是 enabled，说明用户手动开启了
      modifiedCount++
    }
  }

  return { modifiedCount, snapshotExists: true }
}
