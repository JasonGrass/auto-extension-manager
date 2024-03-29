import { getIcon, sortExtension } from ".../utils/extensionHelper"

/**
 * 输入 extensions，在输出中附加 alias, remark 等内容
 */
export function buildRecords(extensions, configs) {
  if (!extensions) {
    return []
  }

  if (!configs) {
    throw new Error("configs is required")
  }

  let records = []

  for (const extension of extensions) {
    const config = configs.extensions?.find((item) => item.extId === extension.id)

    let storeUrl = ""
    if (extension.updateUrl?.includes(".google.com") || extension.channel === "Chrome") {
      storeUrl = "https://chrome.google.com/webstore/detail/" + extension.id
    } else if (
      extension.updateUrl?.includes("edge.microsoft.com") ||
      extension.channel === "Edge"
    ) {
      storeUrl = "https://microsoftedge.microsoft.com/addons/detail/" + extension.id
    }

    let record = {
      key: extension.id,
      ...extension,
      alias: config?.alias,
      remark: config?.remark,
      webStoreUrl: storeUrl,
      icon: getIcon(extension),
      __attach__: config
    }

    records.push(record)
  }

  // 在管理页面（别名设置页面），按照原始名称排序，不考虑别名
  return sortExtension(records, { useAlias: false, ignoreEnable: true })
}
