import chromeP from "webext-polyfill-kinda"

import storage from ".../storage/sync"
import { sendMessage } from ".../utils/messageHelper"
import { isExtExtension } from "../../utils/extensionHelper"

/**
 * 返回分组内实际可控制的扩展。固定分组成员即使同时属于当前分组也必须排除。
 */
export function getControllableGroupExtensions(group, extensions, fixedExtensionIds) {
  const groupExtensionIds = new Set(group?.extensions ?? [])
  const fixedIds = new Set(fixedExtensionIds ?? [])

  return (extensions ?? []).filter(
    (ext) => isExtExtension(ext) && groupExtensionIds.has(ext.id) && !fixedIds.has(ext.id)
  )
}

/**
 * 分组开关的显示状态。mixed 仅由真实扩展状态得出，不会作为操作目标。
 */
export function getGroupEnableState(group, extensions, fixedExtensionIds, enabledById = {}) {
  const controllable = getControllableGroupExtensions(group, extensions, fixedExtensionIds)
  if (controllable.length === 0) {
    return "empty"
  }

  const enabledCount = controllable.filter(
    (ext) => enabledById[ext.id] ?? ext.enabled ?? false
  ).length
  if (enabledCount === 0) {
    return "off"
  }
  if (enabledCount === controllable.length) {
    return "on"
  }
  return "mixed"
}

/**
 * 批量启用或禁用一个分组。启用排他配置后，会保留当前组和固定组并禁用其他扩展。
 */
export async function handleGroupExtensionOnOff(extensions, options, currentGroup, enabled) {
  if (!currentGroup || currentGroup.id === "fixed") {
    return { extensions, actuallyEnabledIds: [], actuallyDisabledIds: [] }
  }

  const self = await chromeP.management.getSelf()
  // 每次操作前重新读取固定分组，避免误伤刚刚固定但 Popup options 尚未同步的扩展。
  const latestGroups = await storage.group.getGroups()
  const fixedExtensionIds = latestGroups.find((g) => g.id === "fixed")?.extensions ?? []
  const fixedIds = new Set(fixedExtensionIds)
  // 操作前重新读取浏览器状态，避免“启停后不刷新列表”时使用到过期的 enabled 值。
  const installedExtensions = (await chromeP.management.getAll()).filter(
    (ext) => isExtExtension(ext) && ext.id !== self.id
  )
  const currentExtensions = getControllableGroupExtensions(
    currentGroup,
    installedExtensions,
    fixedExtensionIds
  )
  const currentIds = new Set(currentExtensions.map((ext) => ext.id))

  const enabledExtensionIds = enabled ? [...currentIds] : []
  let disabledExtensionIds = enabled ? [] : [...currentIds]

  if (enabled && (options.setting.isEnableCurrentGroupAndDisableOthers ?? false)) {
    disabledExtensionIds = installedExtensions
      .map((ext) => ext.id)
      .filter((id) => !fixedIds.has(id) && !currentIds.has(id))
  }

  const actuallyEnabledIds = await setExtensionStates(
    enabledExtensionIds,
    true,
    installedExtensions
  )
  const actuallyDisabledIds = await setExtensionStates(
    disabledExtensionIds,
    false,
    installedExtensions
  )

  await sendMessage("manual-change-group", {
    actuallyEnabledIds,
    actuallyDisabledIds,
    group: currentGroup
  })

  const refreshedExtensions = (await chromeP.management.getAll())
    .filter((ext) => ext.type !== "theme")
    .filter((ext) => ext.id !== self.id)

  return {
    extensions: refreshedExtensions,
    actuallyEnabledIds,
    actuallyDisabledIds
  }
}

async function setExtensionStates(extensionIds, enabled, extensions) {
  const extensionById = new Map(extensions.map((ext) => [ext.id, ext]))
  const actuallyChangedIds = []

  for (const extId of extensionIds) {
    try {
      const info = extensionById.get(extId) ?? (await chromeP.management.get(extId))
      if (info.enabled !== enabled) {
        await chromeP.management.setEnabled(extId, enabled)
        actuallyChangedIds.push(extId)
      }
    } catch (error) {
      console.warn(`${enabled ? "enable" : "disable"} extension fail(${extId}).`, error)
    }
  }

  return actuallyChangedIds
}
