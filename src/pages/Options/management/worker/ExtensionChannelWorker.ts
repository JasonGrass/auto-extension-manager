import { ExtensionRepo } from ".../pages/Background/extension/ExtensionRepo"

export class ExtensionChannelWorker {
  // 检查并保存扩展的安装渠道信息，这个功能仅在 Edge 浏览器上有效，因为 Chrome 浏览器上的扩展通常都是 Chrome 商店的。
  public static async build() {
    const all = await chrome.management.getAll()
    const worker = new ExtensionChannelWorker()
    for (const ext of all) {
      const channel = await worker.getExtensionChannel(ext.id)
      if (channel) {
        continue
      }
      await worker.buildExtensionChannel(ext)
    }
  }

  private _repo: ExtensionRepo

  constructor() {
    this._repo = new ExtensionRepo()
  }

  public async getExtensionChannel(extensionId: string): Promise<string> {
    const info = await this._repo.get(extensionId)
    return info?.channel ?? ""
  }

  private async buildExtensionChannel(
    extensionInfo: chrome.management.ExtensionInfo
  ): Promise<string> {
    // updateUrl : "https://clients2.google.com/service/update2/crx"
    // updateUrl : "https://edge.microsoft.com/extensionwebstorebase/v1/crx"

    if (extensionInfo.installType === "development") {
      await this.saveExtensionChannel(extensionInfo, "Development")
      return "Development"
    }

    const updateUrl = extensionInfo.updateUrl
    if (!updateUrl) {
      return ""
    }
    if (updateUrl.includes(".google.com")) {
      await this.saveExtensionChannel(extensionInfo, "Chrome")
      return "Chrome"
    }
    if (updateUrl.includes("edge.microsoft.com")) {
      await this.saveExtensionChannel(extensionInfo, "Edge")
      return "Edge"
    }
    return ""
  }

  private async saveExtensionChannel(
    extensionInfo: chrome.management.ExtensionInfo,
    channel: "Chrome" | "Edge" | "Development"
  ) {
    const record = await this._repo.get(extensionInfo.id)
    if (!record) {
      await this._repo.set({ ...extensionInfo, channel, recordUpdateTime: Date.now() })
      return
    }
    await this._repo.set({ ...record, ...extensionInfo, channel, recordUpdateTime: Date.now() })
  }
}
