import localforage from "localforage"
import OptionsSync from "webext-options-sync"

import { notifyRuleConfigChanged } from ".../utils/messageHelper"
import strCompress from "../utils/ConfigCompress"
import largeSync from "../utils/LargeSyncStorage"

const OptionsStorage = new OptionsSync({
  storageType: "sync",
  defaults: {
    // 分组数据
    groups: [],
    // 情景模式数据
    scenes: [],
    // 规则配置
    ruleConfig: [],
    // 通用配置
    setting: {},
    // 扩展管理类数据
    management: {}
  }
})

class ChromeSyncStorage {
  /**
   * 获取全部的配置数据
   */
  async getAll() {
    const originSyncContent = await chrome.storage.sync.get(null)
    if (originSyncContent.hasOwnProperty("options")) {
      // 说明是之前用 OptionsSync 保存的数据
      const oldData = await OptionsStorage.getAll()
      await chrome.storage.sync.clear()
      await this.set(oldData)
      console.log("[ChromeSyncStorage] 检测到旧数据，已自动迁移")
    }

    return new Promise((resolve, reject) => {
      largeSync.get(["setting", "groups", "scenes", "ruleConfig", "management"], (items, error) => {
        if (error) reject(error)
        else resolve(items)
      })
    })
  }

  /**
   * 设置配置项
   */
  async set(options) {
    return new Promise((resolve, reject) => {
      largeSync.set(options, () => {
        if (chrome.runtime.lastError) reject(new Error(chrome.runtime.lastError.message))
        else resolve()
      })
    })
  }
}

const LargeSyncStorage = new ChromeSyncStorage()

export const SyncOptionsStorage = {
  /**
   * 获取全部配置
   */
  async getAll() {
    const options = await LargeSyncStorage.getAll()

    if (!options.setting) {
      options.setting = {}
    }
    // setting 中的默认值 (尤其是默认为 true 的值，需要额外处理)
    if (options.setting.isShowFixedExtension === undefined) {
      options.setting.isShowFixedExtension = true
    }
    if (options.setting.isShowDotOfFixedExtension === undefined) {
      options.setting.isShowDotOfFixedExtension = true
    }
    if (options.setting.isShowLockButtonInOperationMenu === undefined) {
      options.setting.isShowLockButtonInOperationMenu = false
    }
    if (options.setting.isShowAppNameInGirdView === undefined) {
      // 默认显示扩展名称
      options.setting.isShowAppNameInGirdView = true
    }
    // 默认排序方式修改成 name
    if (options.setting.defaultSortField === undefined) {
      options.setting.defaultSortField = "name"
    }

    // default for show hidden extension is set to false
    if (options.setting.isShowHiddenExtension === undefined) {
      options.setting.isShowHiddenExtension = false
    }
    if (options.setting.isEnableCurrentGroupAndDisableOthers === undefined) {
      options.setting.isEnableCurrentGroupAndDisableOthers = false
    }
    if (options.setting.isActivateCurrentSceneAndDisableOthers === undefined) {
      // Multiple scenes are allowed by default; exclusivity is an explicit user preference.
      options.setting.isActivateCurrentSceneAndDisableOthers = false
    }

    // 情景模式
    if (!options.scenes) {
      options.scenes = []
    }

    // 分组管理
    if (!options.groups) {
      options.groups = []
    } else {
      options.groups = strCompress.decompress(options.groups)
    }

    // 扩展管理
    if (!options.management) {
      options.management = {}
    } else {
      options.management = strCompress.decompress(options.management)
    }

    if (!options.management.extensions) {
      options.management.extensions = []
    }

    // 规则设置
    if (!options.ruleConfig) {
      options.ruleConfig = []
    } else {
      options.ruleConfig = strCompress.decompress(options.ruleConfig)
    }

    return options
  },

  /**
   * 输出 sync 存储使用总量
   */
  async getUsage() {
    const total = await chrome.storage.sync.getBytesInUse(null)
    return total
  },

  /**
   * 更新配置中的某一项，e.g. set({setting: settingObj})
   */
  async set(option) {
    const refreshRules = ["ruleConfig", "groups", "scenes"].some((key) =>
      Object.prototype.hasOwnProperty.call(option, key)
    )
    if (option.groups) {
      option.groups = strCompress.compress(option.groups)
    }
    if (option.management) {
      option.management = strCompress.compress(option.management)
    }
    if (option.ruleConfig) {
      option.ruleConfig = strCompress.compress(option.ruleConfig)
    }

    try {
      await LargeSyncStorage.set(option)
      await finishWrite(refreshRules)
    } catch (error) {
      console.error("保存配置失败", error)
      if (error.code === "CONFIG_REFRESH_FAILED") {
        tryShowErrorMessage(chrome.i18n.getMessage("config_refresh_failed"))
      } else if (error.code === "CONFIG_CACHE_FAILED") {
        tryShowErrorMessage(chrome.i18n.getMessage("config_cache_failed"))
      } else if (
        error.message.includes("QUOTA_BYTES_PER_ITEM") ||
        error.message.includes("QUOTA_BYTES")
      ) {
        tryShowErrorMessage("保存配置失败，超过浏览器存储限制")
      } else {
        tryShowErrorMessage(`保存配置失败，${error.message}`)
      }
      throw error
    }
  },

  /**
   * 覆盖式更新所有配置
   */
  async setAll(options) {
    await chrome.storage.sync.clear()
    options.groups = strCompress.compress(options.groups)
    options.management = strCompress.compress(options.management)
    options.ruleConfig = strCompress.compress(options.ruleConfig)
    await LargeSyncStorage.set(options)
    await finishWrite(true)
  },

  async clearAll() {
    await chrome.storage.sync.clear()
    await finishWrite(true)
  }
}

async function finishWrite(refreshRules) {
  let cacheFailure
  try {
    await updateCache()
  } catch (error) {
    cacheFailure = error
  }
  // A failed optional cache must not leave the worker running deleted rules.
  if (refreshRules) await notifyRuleConfigChanged()
  if (cacheFailure) {
    const error = new Error("Configuration saved, but local cache update failed", {
      cause: cacheFailure
    })
    error.code = "CONFIG_CACHE_FAILED"
    throw error
  }
}

class OptionStorageViewBuilder {
  getApi() {
    if (this.api) {
      return this.api
    } else {
      this.api = {}
      return this.api
    }
  }
}

// 让外部注入 message 的实现，因为在 background 下，不支持 UI，不能在这里写 UI 相关的代码，如引入 antd
export const OptionStorageViewProvider = new OptionStorageViewBuilder()

function tryShowErrorMessage(text) {
  try {
    if (typeof window === "undefined") {
      return
    }
    const api = OptionStorageViewProvider.getApi()
    if (api.message) {
      api.message.error(text)
    }
  } catch (error) {
    console.log("Cannot Show Message Now", error)
  }
}

/**
 * 更新本地的 options 缓存
 */
async function updateCache() {
  const forage = localforage.createInstance({
    driver: localforage.LOCALSTORAGE,
    name: "TempCache",
    version: 1.0,
    storeName: "options"
  })

  const allOptions = await SyncOptionsStorage.getAll()
  await forage.setItem("all_options", allOptions)
  console.log("update cache options after updating options")
}
