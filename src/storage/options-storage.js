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

      console.log("OptionsSync migrations", popupWidth)

      popupWidth = Math.min(Math.max(200, popupWidth), 1000)
      options.popupWidth = popupWidth

      // log
      console.log("sync options:", options)
    }
  ]
})

export const LocalOptionsStorage = new OptionsSync({
  storageType: "local",
  defaults: {},
  migrations: [
    (options) => {
      // log
      console.log("local options:", options)
    }
  ]
})

export default OptionsStorage
