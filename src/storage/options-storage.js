import OptionsSync from "webext-options-sync"

export const OptionsStorage = new OptionsSync({
  storageType: "sync",
  defaults: {
    popupWidth: 400,
    groups: [],
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
    return options
  }
}

export default OptionsStorage
