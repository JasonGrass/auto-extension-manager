import OptionsSync from "webext-options-sync"

import strCompress from "./utils/ConfigCompress"

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

export const SyncOptionsStorage = {
  /**
   * 获取全部配置
   */
  async getAll() {
    const options = await OptionsStorage.getAll()
    if (!options.setting) {
      options.setting = {}
    }
    if (!options.management) {
      options.management = {}
    }
    if (!options.management.extensions) {
      options.management.extensions = []
    }
    if (!options.scenes) {
      options.scenes = []
    }
    if (!options.groups) {
      options.groups = []
    }

    if (!options.ruleConfig) {
      options.ruleConfig = []
    } else {
      options.ruleConfig = strCompress.decompress(options.ruleConfig)
    }
    return options
  },

  /**
   * 获取未经解压的原始存储数据，用于显示存储大小，普通业务请勿使用
   */
  async getOriginAll() {
    const options = await OptionsStorage.getAll()
    return options
  },

  /**
   * 更新配置中的某一项，e.g. set({setting: settingObj})
   */
  async set(option) {
    if (option.ruleConfig) {
      option.ruleConfig = strCompress.compress(option.ruleConfig)
    }
    await OptionsStorage.set(option)
  },

  /**
   * 覆盖式更新所有配置
   */
  async setAll(options) {
    options.ruleConfig = strCompress.compress(options.ruleConfig)
    await OptionsStorage.setAll(options)
  }
}
