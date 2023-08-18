import OptionsSync from "webext-options-sync"

export const OptionsStorage = new OptionsSync({
  storageType: "sync",
  defaults: {
    popupWidth: 400,
    groups: [],
    scenes: [],
    ruleConfig: [],
    setting: {}
  },
  migrations: [
    (options) => {
      let { popupWidth } = options
      popupWidth = Math.min(Math.max(200, popupWidth), 1000)
      options.popupWidth = popupWidth
    }
  ]
})

export const LocalOptionsStorage = new OptionsSync({
  storageType: "local",
  defaults: {},
  migrations: [(options) => {}]
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
