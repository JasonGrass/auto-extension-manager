import OptionsSync from "webext-options-sync"

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
    }
    return options
  },

  /**
   * 更新配置中的某一项，e.g. set({setting: settingObj})
   */
  async set(option) {
    await OptionsStorage.set(option)
  },

  /**
   * 覆盖式更新所有配置
   */
  async setAll(options) {
    await OptionsStorage.setAll(options)
  }
}

const InnerLocalOptionsStorage = new OptionsSync({
  storageType: "local",
  defaults: {
    scene: {}
  }
})

export const LocalOptionsStorage = {
  /**
   * 获取全部本地配置
   */
  async getAll() {
    const options = await InnerLocalOptionsStorage.getAll()

    if (!options.scene) {
      options.scene = {}
    }
  },

  async set(option) {
    await InnerLocalOptionsStorage.set(option)
  }
}
