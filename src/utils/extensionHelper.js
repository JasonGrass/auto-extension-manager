import { isEdgeRuntime } from ".../utils/channelHelper"
import defaultPuzzleIcon from "../assets/img/puzzle.svg"
import { buildTextIconDataUrl, getManifestIconCandidates } from "./extensionIconPolicy"
import { downloadImageDataUrl, renderImageDataUrl } from "./utils"

export const getIcon = function (extension, size = 16) {
  // 前台列表会附加 IndexedDB 中的持久缓存。优先使用它，保证只声明 action.default_icon
  // 的扩展也能显示文字兜底，而不是固定的拼图图标。
  if (extension?.icon) {
    return extension.icon
  }

  const targetSize = size * (globalThis.devicePixelRatio ?? 1)
  return (
    getManifestIconCandidates(extension, targetSize)[0] ||
    buildTextIconDataUrl(extension?.name) ||
    defaultPuzzleIcon
  )
}

/**
 * 尝试下载扩展在 manifest 顶层 `icons` 中声明的图标，并转成可缓存的 Data URL。
 *
 * 注意：该 API 无法获得 action.default_icon。对于只声明 action.default_icon 的扩展
 * （例如 Tabs Outliner），或资源未对其他扩展开放的情况，本函数会返回空字符串，
 * 由调用方生成文字图标等兜底内容。
 *
 * 仅支持在具备 DOM 的页面调用；单个候选图标下载失败后会继续尝试较小尺寸图标，
 * 避免一个损坏或不可访问的大图导致整个扩展都没有缓存图标。
 */
export const downloadIconDataUrl = async function (appInfo) {
  const iconCandidates = getManifestIconCandidates(appInfo, 128)

  for (const iconUrl of iconCandidates) {
    try {
      return await downloadImageDataUrl(iconUrl)
    } catch {
      try {
        return await renderImageDataUrl(iconUrl)
      } catch {
        // 跨扩展资源被拒绝时继续尝试下一尺寸。
      }
    }
  }

  return ""
}

/**
 * 按真实 manifest 图标、文字图标的顺序解析最佳可用图标。
 * @returns {Promise<{icon: string, iconSource: "manifest" | "fallback"}>}
 */
export const resolveExtensionIcon = async function (appInfo) {
  const manifestIcon = await downloadIconDataUrl(appInfo)
  if (manifestIcon) return { icon: manifestIcon, iconSource: "manifest" }

  const fallback = await buildTextIcon(appInfo?.name)
  return { icon: fallback, iconSource: "fallback" }
}

/**
 * 根据扩展名称生成稳定的文字图标 Data URL。
 *
 * 这用于无法通过 management API 获取真实图标的扩展。返回 Data URL 而不是 Blob URL，
 * 以保证图标可安全地缓存到 IndexedDB，且不随创建它的 Popup 页面关闭而失效。
 */
export const buildTextIcon = async (name) => {
  return buildTextIconDataUrl(name)
}

export const isAppExtension = function (ext) {
  const appTypes = ["hosted_app", "packaged_app", "legacy_packaged_app"]
  return appTypes.includes(ext.type)
}

export const isExtExtension = function (ext) {
  const extTypes = ["extension"]
  return extTypes.includes(ext.type)
}

export const filterExtensions = (extensions, filter) => {
  if (!extensions) {
    return []
  }
  return extensions.filter(filter)
}

/**
 * 对扩展进行排序，安装是否启用 + 名称排序，如果 options 中配置了 ignoreEnable，则只按照名称排序。
 */
export const sortExtension = (extensions, options) => {
  if (!extensions || extensions.length === 0) {
    return []
  }

  options = options || {}

  if (typeof extensions[0] !== "object") {
    throw Error("sortExtension extensions param should be object type")
  }

  const list = []
  // distinct
  extensions.forEach((ext) => {
    if (list.find((i) => i.id === ext.id)) {
      return
    }
    list.push(ext)
  })

  const getCompareValue = (ext) => {
    if (options.useAlias === undefined || options.useAlias === true) {
      return ext.__attach__?.alias ? ext.__attach__?.alias : ext.name
    }
    if (options.useAlias === false) {
      return ext.name
    }
    return ext.name
  }

  return list.sort((a, b) => {
    const aName = getCompareValue(a)
    const bName = getCompareValue(b)
    if (options.ignoreEnable) {
      return aName.localeCompare(bName) // Sort by name
    } else {
      if (a.enabled === b.enabled) {
        return aName.localeCompare(bName) // Sort by name
      }
      return a.enabled < b.enabled ? 1 : -1 // Sort by state
    }
  })
}

/**
 * 根据额外的配置数据，给插件添加附加的一些数据，如别名，备注等
 */
export const appendAdditionInfo = (extensions, managementOptions) => {
  if (!extensions) {
    return []
  }
  if (!managementOptions || !managementOptions.extensions) {
    return extensions
  }

  for (const extension of extensions) {
    const addition = managementOptions.extensions.find((ext) => ext.extId === extension.id)
    if (!addition) {
      extension.__attach__ = {}
      continue
    }
    extension.__attach__ = addition
  }

  return extensions
}

export const getHomepageUrl = (item, alwaysLinkToStore) => {
  if (!alwaysLinkToStore) {
    return item.homepageUrl
  }

  const updateUrl = item.updateUrl

  if (!updateUrl) {
    return item.homepageUrl
  }

  if (updateUrl.includes(".google.com")) {
    return "https://chrome.google.com/webstore/detail/" + item.id
  } else if (updateUrl.includes("edge.microsoft.com")) {
    return "https://microsoftedge.microsoft.com/addons/detail/" + item.id
  } else {
    return item.homepageUrl
  }
}

export const getOriginSettingUrl = (item) => {
  if (isEdgeRuntime()) {
    // edge://extensions/?id=xxx
    return `edge://extensions/?id=${item.id}`
  } else {
    // chrome://extensions/?id=xxx
    return `chrome://extensions/?id=${item.id}`
  }
}
