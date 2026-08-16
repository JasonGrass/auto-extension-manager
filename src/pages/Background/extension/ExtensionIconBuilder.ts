import chromeP from "webext-polyfill-kinda"

import { buildTextIcon, resolveExtensionIcon } from ".../utils/extensionHelper"
import {
  EXTENSION_ICON_CACHE_VERSION,
  shouldRefreshExtensionIcon
} from ".../utils/extensionIconPolicy"
import { LocalOptions } from "../../../storage/local"
import { HistoryRecord } from "../history/Record"
import { ExtensionRepo } from "./ExtensionRepo"

/**
 * 专门用来处理扩展的 ICON 在本地的缓存问题；
 * 此类仅限 Popup, Options 等有 BOM 和 DOM 支持的页面调用
 */
export class ExtensionIconBuilder {
  /**
   * 构建 ICON，保存到本地数据库缓存中
   */
  public static build(force: boolean = false) {
    setTimeout(() => {
      const builder = new ExtensionIconBuilder()
      builder.exec(force)
    }, 3000) // 延迟执行，不与渲染线程抢资源
  }

  /**
   * 为历史记录中的项，补充 ICON
   */
  public static async fill(records: HistoryRecord[]) {
    let useFallbackMethod = false
    for (const record of records) {
      // 已经存在 icon
      if (record.icon) continue

      const repo = new ExtensionRepo()
      const extension = await repo.get(record.extensionId)
      if (extension?.icon && !shouldRefreshExtensionIcon(extension)) {
        // 缓存的 extension 数据中，有 icon (base64 编码)
        record.icon = extension.icon // 绝大多数情况下，这里能获取到数据
        continue
      }

      useFallbackMethod = true
      // 对仍然安装的扩展读取最新 management 信息，以便使用 manifest 图标或主页 favicon。
      try {
        const chromeExt = await chromeP.management.get(record.extensionId)
        const resolved = await resolveExtensionIcon(chromeExt)
        if (resolved.icon) {
          record.icon = resolved.icon
          continue
        }
      } catch {
        // 已卸载扩展无法查询，继续使用历史记录名称生成文字图标。
      }
      record.icon = await buildTextIcon(record.name)
    }

    if (useFallbackMethod) {
      ExtensionIconBuilder.build()
    }
  }

  private repo: ExtensionRepo
  private localOptions: LocalOptions

  constructor() {
    this.repo = new ExtensionRepo()
    this.localOptions = new LocalOptions()
  }

  public async exec(force: boolean = false) {
    const [keys, installedExtensions] = await Promise.all([
      this.repo.getKeys(),
      chromeP.management.getAll()
    ])
    const cachedExtensions = await Promise.all(keys.map((key) => this.repo.get(key)))
    const cacheById = new Map(
      cachedExtensions
        .filter((extension) => extension)
        .map((extension) => [extension!.id, extension!])
    )

    // 同时比较当前已安装版本与缓存版本：即使后台安装事件被遗漏，也会在下一次打开页面时重取。
    const hasPendingIcon = installedExtensions.some((extension) =>
      shouldRefreshExtensionIcon(cacheById.get(extension.id), false, extension.version)
    )

    // 因为是耗性能的操作，不必每次都执行；但有待补建的旧缓存时必须执行一次迁移。
    const isAnyNewInstalled = await this.localOptions.getNeedBuildExtensionIcon()
    if (!force && !isAnyNewInstalled && !hasPendingIcon) {
      return
    }

    console.log("[ExtensionIconBuilder] build")

    for (const chromeExt of installedExtensions) {
      const extension = cacheById.get(chromeExt.id)
      if (!shouldRefreshExtensionIcon(extension, force, chromeExt.version)) {
        continue
      }

      try {
        const resolved = await resolveExtensionIcon(chromeExt)
        if (!resolved.icon) {
          continue
        }
        const info = {
          ...extension,
          ...chromeExt,
          state: "install" as const,
          icon: resolved.icon,
          iconSource: resolved.iconSource,
          iconCacheVersion: EXTENSION_ICON_CACHE_VERSION,
          recordUpdateTime: Date.now(),
          needUpdateIcon: false
        }
        await this.repo.set(info)
      } catch {
        // ignore
      }
    }

    await this.localOptions.setNeedBuildExtensionIcon(false)
  }
}
