import { nanoid } from "nanoid"
import OptionsSync from "webext-options-sync"

const optionsStorage = new OptionsSync({
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
      console.log("options:", options)
    }
  ]
})
export default optionsStorage
