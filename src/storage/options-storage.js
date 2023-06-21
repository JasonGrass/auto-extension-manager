import OptionsSync from "webext-options-sync"

const OptionsStorage = new OptionsSync({
  storageType: "sync",
  defaults: {
    popupWidth: 400,
    groups: []
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

export default OptionsStorage
