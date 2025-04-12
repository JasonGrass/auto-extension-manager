import chromeP from "webext-polyfill-kinda"

import { sendMessage } from ".../utils/messageHelper"
import { isAppExtension, isExtExtension } from "../../utils/extensionHelper"

/**
 * 执行扩展的启用与禁用
 * @param {*} extensions 所有被操作扩展
 * @param {*} options 用户设置
 * @param {*} selectGroups 当前选中的分组集合
 * @param {*} currentGroup 引起变化的当前分组
 * @returns 新的扩展信息
 * */
export async function handleExtensionOnOff(extensions, options, selectGroups, currentGroup) {
  if (!selectGroups) {
    // 没有选择任何分组，啥也不做
    return []
  }

  const self = await chromeP.management.getSelf()

  const fixedExtensionIds = options.groups.find((g) => g.id === "fixed")?.extensions ?? []
  const hiddenExtensionIds = options.groups.find((g) => g.id === "hidden")?.extensions ?? []
  const currentExtensionIds = selectGroups.map((g) => g.extensions).flat()

  // 被启用的扩展：固定分组和当前分组中的扩展
  const enabledExtensionIds = Array.from(
    new Set([...fixedExtensionIds, ...hiddenExtensionIds, ...currentExtensionIds])
  )
  // 被禁用的扩展：除此之外的扩展（不包括 APP 类型的扩展，不包括自身）
  const disabledExtensionIds = extensions
    .filter((ext) => isExtExtension(ext))
    .map((ext) => ext.id)
    .filter((id) => id !== self.id)
    .filter((id) => !enabledExtensionIds.includes(id))

  // const disabledExtensions = extensions.filter((ext) => disabledExtensionIds.includes(ext.id))
  // const enabledExtensions = extensions.filter((ext) => enabledExtensionIds.includes(ext.id))

  const actuallyEnabledIds = [] // 实际执行了启用动作的扩展 ID
  for (const extId of enabledExtensionIds) {
    try {
      const info = await chromeP.management.get(extId)
      if (!info.enabled) {
        await chromeP.management.setEnabled(extId, true)
        actuallyEnabledIds.push(extId)
      }
    } catch (error) {
      console.warn(`enable extension fail(${extId}).`, error)
    }
  }

  const actuallyDisabledIds = [] // 实际执行了禁用动作的扩展 ID
  for (const extId of disabledExtensionIds) {
    try {
      const info = await chromeP.management.get(extId)
      if (info.enabled) {
        await chromeP.management.setEnabled(extId, false)
        actuallyDisabledIds.push(extId)
      }
    } catch (error) {
      console.warn(`disable extension fail(${extId}).`, error)
    }
  }

  // 通知 background，手动启用或禁用了哪些扩展，以进行历史操作记录
  await sendMessage("manual-change-group", {
    actuallyEnabledIds,
    actuallyDisabledIds,
    group: currentGroup
  })

  let allExtensions = await chromeP.management.getAll()
  allExtensions = allExtensions
    .filter(
      (ext) =>
        enabledExtensionIds.includes(ext.id) ||
        disabledExtensionIds.includes(ext.id) ||
        isAppExtension(ext) // 启用和禁用的里面，都没有包含 APP 类型的扩展
    )
    .filter((ext) => ext.id !== self.id)

  // 如果用户配置了不显示固定分组中的扩展，则这里过滤掉
  const isShowFixedExtension = options.setting.isShowFixedExtension ?? true
  if (!isShowFixedExtension) {
    allExtensions = allExtensions.filter((ext) => !fixedExtensionIds.includes(ext.id))
  }

  const isShowHiddenExtension = options.setting.isShowHiddenExtension ?? false
  if (!isShowHiddenExtension) {
    allExtensions = allExtensions.filter((ext) => !hiddenExtensionIds.includes(ext.id))
  }

  return allExtensions
}
