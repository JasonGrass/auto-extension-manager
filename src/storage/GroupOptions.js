import { nanoid } from "nanoid"

import OptionsStorage from "./options-storage"

export const GroupOptions = {
  async getGroups() {
    const all = await OptionsStorage.getAll()
    let groups = all.groups ? [...all.groups] : []
    return groups
  },

  async addGroup(group) {
    const all = await OptionsStorage.getAll()
    let groups = all.groups ? [...all.groups] : []

    const exist = groups.find((g) => g.name === group.name)
    if (exist) {
      throw Error(`already exist same group named ${group.name}`)
    }

    if (!group.id) {
      group.id = nanoid()
    }

    groups.push(group)

    await OptionsStorage.set({ groups })
  },

  async deleteGroup(id) {
    const all = await OptionsStorage.getAll()
    if (!all.groups) {
      return
    }
    const newGroups = all.groups.filter((g) => g.id !== id)
    await OptionsStorage.set({ groups: newGroups })
  }
}

export default GroupOptions
