import { message } from "antd"
import OptionsSync from "webext-options-sync"

import strCompress from "./utils/ConfigCompress"
import largeSync from "./utils/LargeSyncStorage"

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
      largeSync.get(["setting", "groups", "scenes", "ruleConfig", "management"], (items) => {
        resolve(items)
      })
    })
  }

  /**
   * 设置配置项
   */
  async set(options) {
    return new Promise((resolve, reject) => {
      largeSync.set(options, () => {
        resolve()
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

    // 扩展别名
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
  async printUsage() {
    const total = await chrome.storage.sync.getBytesInUse(null)
    const use = (total / 1024).toFixed(2)
    console.log(`Chrome Sync Storage Total Use: ${use}KB / 100KB`)
  },

  /**
   * 更新配置中的某一项，e.g. set({setting: settingObj})
   */
  async set(option) {
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
    } catch (error) {
      console.error("保存配置失败", error)
      if (error.message.includes("QUOTA_BYTES_PER_ITEM")) {
        tryShowErrorMessage("保存配置失败，超过浏览器存储限制")
      } else {
        tryShowErrorMessage(`保存配置失败，${error.message}`)
      }
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
  }
}

function tryShowErrorMessage(text) {
  try {
    if (!window) {
      return
    }
    message.error(text)
  } catch (error) {
    console.log("Cannot Show Message Now", error)
  }
}
