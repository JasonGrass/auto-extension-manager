import { nanoid } from "nanoid"

import optionsStorage from "./options-storage"

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

export default GroupOptions
