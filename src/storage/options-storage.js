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

export const GroupOptions = {
  async getGroups() {
    const all = await optionsStorage.getAll()
    let groups = all.groups ? [...all.groups] : []
    return groups
  },

  async addGroup(group) {
    const all = await optionsStorage.getAll()
    let groups = all.groups ? [...all.groups] : []

    const exist = groups.find((g) => g.name === group.name)
    if (exist) {
      throw Error(`already exist same group named ${group.name}`)
    }

    if (!group.id) {
      group.id = nanoid()
    }

    groups.push(group)

    await optionsStorage.set({ groups })
  },

  async deleteGroup(id) {
    const all = await optionsStorage.getAll()
    if (!all.groups) {
      return
    }
    const newGroups = all.groups.filter((g) => g.id != id)
    await optionsStorage.set({ groups: newGroups })
  }
}

export default optionsStorage
