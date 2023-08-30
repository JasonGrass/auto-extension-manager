import chromeP from "webext-polyfill-kinda"

import { downloadIconDataUri } from ".../utils/extensionHelper"
import { LocalOptions } from "../../../storage/local"
import { ExtensionRepo } from "./ExtensionRepo"

/**
 * 专门用来处理扩展的 ICON 在本地的缓存问题；
 * 此类仅限 Popup, Options 等有 BOM 和 DOM 支持的页面调用
 */
export class ExtensionIconBuilder {
  public static build() {
    setTimeout(() => {
      const builder = new ExtensionIconBuilder()
      builder.exec()
    }, 1000)
  }

  private repo: ExtensionRepo
  private localOptions: LocalOptions

  constructor() {
    this.repo = new ExtensionRepo()
    this.localOptions = new LocalOptions()
  }

  public async exec() {
    // 因为是好性能的操作，不必每次都执行。
    const isAnyNewInstalled = await this.localOptions.getIsAnyNewInstalled()
    if (isAnyNewInstalled === false) {
      return
    }

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

    await this.localOptions.setIsAnyNewInstalled(false)
  }
}
