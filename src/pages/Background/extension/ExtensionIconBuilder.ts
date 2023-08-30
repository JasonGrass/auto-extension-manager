import chromeP from "webext-polyfill-kinda"

import { buildTextIcon, downloadIconDataUri } from ".../utils/extensionHelper"
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
      builder.exec()
    }, 1000)
  }

  /**
   * 为历史记录中的项，补充 ICON
   */
  public static async fill(records: HistoryRecord[]) {
    let useFallbackMethod = false
    for (const record of records) {
      if (record.icon) continue

      const repo = new ExtensionRepo()
      const extension = await repo.get(record.extensionId)
      if (extension && extension.icon) {
        record.icon = extension.icon // 绝大多数情况下，这里能获取到数据
        continue
      }

      useFallbackMethod = true
      const icon = await downloadIconDataUri(record.id)
      if (icon) {
        record.icon = icon
        continue
      }
      record.icon = buildTextIcon(record.name)
    }

    if (useFallbackMethod) {
      ExtensionIconBuilder.build(true)
    }
  }

  private repo: ExtensionRepo
  private localOptions: LocalOptions

  constructor() {
    this.repo = new ExtensionRepo()
    this.localOptions = new LocalOptions()
  }

  public async exec(force: boolean = false) {
    // 因为是好性能的操作，不必每次都执行。
    const isAnyNewInstalled = await this.localOptions.getNeedBuildExtensionIcon()
    if (!force && isAnyNewInstalled === false) {
      return
    }

    console.log("[ExtensionIconBuilder] build")

    const keys = await this.repo.getKeys()

    for (const key of keys) {
      const extension = await this.repo.get(key)
      if (!extension || extension.icon) {
        continue
      }

      try {
        const chromeExt = await chromeP.management.get(key)
        const dataUri = await downloadIconDataUri(chromeExt)
        if (!dataUri) {
          continue
        }
        const info = { ...extension, ...chromeExt, icon: dataUri, recordUpdateTime: Date.now() }
        this.repo.set(info)
      } catch (error) {
        // ignore
      }
    }

    await this.localOptions.setNeedBuildExtensionIcon(false)
  }
}
