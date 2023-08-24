import OptionsSync from "webext-options-sync"

export const OptionsStorage = new OptionsSync({
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

export const LocalOptionsStorage = new OptionsSync({
  storageType: "local",
  defaults: {}
})

export const SyncOptionsStorage = {
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
  }
}

export default OptionsStorage
