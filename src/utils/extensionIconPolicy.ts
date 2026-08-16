/**
 * 扩展图标获取限制：
 *
 * chrome.management.ExtensionInfo.icons 只反映目标扩展 manifest 顶层的 `icons` 声明，
 * 不会返回 `action.default_icon`，也无法读取其它扩展通过 action.setIcon() 动态设置的
 * 工具栏图标。即使知道 `action.default_icon` 的包内路径，只要目标扩展没有通过
 * web_accessible_resources 向本扩展开放该文件，也不能跨扩展读取。
 *
 * 因此，对于只声明 `action.default_icon` 的扩展，公开 API 无法保证取得原始 PNG。
 * 本项目只能依次尝试顶层 manifest 图标、扩展独立主页 favicon，最后生成稳定的文字图标。
 * 若必须获取原始图标，只能额外下载并解析商店/CRX 安装包，这会引入网络权限、隐私、
 * 商店兼容性和远程接口稳定性问题，当前策略不采用这种方式。
 */
export const EXTENSION_ICON_CACHE_VERSION = 2

type IconRecord = {
  icon?: string
  iconCacheVersion?: number
  iconSource?: string
  needUpdateIcon?: boolean
  state?: string
  version?: string
}

type ExtensionIcon = {
  size?: number
  url?: string
}

type ExtensionInfoLike = {
  homepageUrl?: string
  icons?: ExtensionIcon[]
  name?: string
}

/**
 * 判断缓存是否应重新获取。缓存格式升级、目标扩展版本变化以及显式强制刷新都会触发。
 */
export const shouldRefreshExtensionIcon = (
  record: IconRecord | null | undefined,
  force = false,
  installedVersion?: string
) => {
  return (
    force ||
    record?.state === "uninstall" ||
    !record?.icon ||
    !record.iconSource ||
    record.iconCacheVersion !== EXTENSION_ICON_CACHE_VERSION ||
    record.needUpdateIcon === true ||
    (!!installedVersion && record.version !== installedVersion)
  )
}

/**
 * 获取最接近目标尺寸的 manifest 顶层图标 URL，并保留其它尺寸作为下载失败时的候选。
 * 注意：这里的 extension.icons 不包含 action.default_icon。
 */
export const getManifestIconCandidates = (extension: ExtensionInfoLike, size = 128) => {
  const icons = (extension?.icons ?? []).filter(
    (icon): icon is Required<ExtensionIcon> =>
      typeof icon?.url === "string" && icon.url.length > 0 && typeof icon.size === "number"
  )

  return [...icons]
    .sort((a, b) => {
      const aEnough = a.size >= size
      const bEnough = b.size >= size
      if (aEnough !== bEnough) return aEnough ? -1 : 1
      return aEnough ? a.size - b.size : b.size - a.size
    })
    .map((icon) => icon.url)
    .filter((url, index, urls) => urls.indexOf(url) === index)
}

const STORE_HOSTS = new Set([
  "chrome.google.com",
  "chromewebstore.google.com",
  "microsoftedge.microsoft.com",
  "addons.mozilla.org"
])

/** 商店页面的 favicon 是商店自身图标，不能代表扩展，因而只使用独立主页。 */
export const getExtensionHomepageForFavicon = (extension: ExtensionInfoLike) => {
  try {
    const url = new URL(extension?.homepageUrl ?? "")
    if (!(["http:", "https:"] as string[]).includes(url.protocol)) return ""
    if (STORE_HOSTS.has(url.hostname.toLowerCase())) return ""
    return url.href
  } catch {
    return ""
  }
}

const escapeXml = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")

/** 同步生成可直接用于 img.src、也可长期写入 IndexedDB 的文字 SVG Data URL。 */
export const buildTextIconDataUrl = (name?: string) => {
  const character = Array.from(name?.trim() ?? "")[0]
  if (!character) return ""

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><rect width="128" height="128" rx="20" fill="#737373"/><text x="64" y="67" fill="white" font-family="Arial,sans-serif" font-size="72" font-weight="600" text-anchor="middle" dominant-baseline="middle">${escapeXml(character)}</text></svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}
