import chromeP from "webext-polyfill-kinda"

/**
 * 执行扩展的启用与禁用
 * @param {*} extensions 所有被操作扩展
 * @param {*} options 用户设置
 * @param {*} group 当前选中的分组
 * @returns 新的扩展信息
 * */
export async function handleExtensionOnOff(extensions, options, group) {
  if (!group) {
    // 没有选择任何分组，啥也不做
    return []
  }

  const self = await chromeP.management.getSelf()

  const fixedExtensionIds = options.groups.find((g) => g.id === "fixed")?.extensions ?? []
  const currentExtensionIds = group.extensions ?? []
  const enabledExtensionIds = Array.from(new Set([...fixedExtensionIds, ...currentExtensionIds]))
  const disabledExtensionIds = extensions
    .map((ext) => ext.id)
    .filter((id) => !enabledExtensionIds.includes(id) && id !== self.id)

  // const disabledExtensions = extensions.filter((ext) => disabledExtensionIds.includes(ext.id))
  // const enabledExtensions = extensions.filter((ext) => enabledExtensionIds.includes(ext.id))

  for (const extId of enabledExtensionIds) {
    const info = await chromeP.management.get(extId)
    if (!info.enabled) {
      await chromeP.management.setEnabled(extId, true)
    }
  }

  for (const extId of disabledExtensionIds) {
    const info = await chromeP.management.get(extId)
    if (info.enabled) {
      await chromeP.management.setEnabled(extId, false)
    }
  }

  let allExtensions = await chromeP.management.getAll()
  allExtensions = allExtensions.filter(
    (ext) => enabledExtensionIds.includes(ext.id) || disabledExtensionIds.includes(ext.id)
  )

  // 如果用户配置了不显示固定分组中的扩展，则这里过滤掉
  const isShowFixedExtension = options.setting.isShowFixedExtension ?? true
  if (!isShowFixedExtension) {
    allExtensions = allExtensions.filter((ext) => !fixedExtensionIds.includes(ext.id))
  }

  return allExtensions
}
