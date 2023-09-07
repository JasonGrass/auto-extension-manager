import { nanoid } from "nanoid"

import { SyncOptionsStorage } from "./options-storage"

export const GroupOptions = {
  async getGroups() {
    const all = await SyncOptionsStorage.getAll()
    let groups = all.groups ? [...all.groups] : []

    if (groups.filter((g) => g.id === "fixed").length < 1) {
      const group = {
        id: "fixed",
        name: "fixed group",
        extensions: []
      }
      groups.unshift(group)
      this.addGroup(group)
    }

    return groups
  },

  async addGroup(group) {
    const all = await SyncOptionsStorage.getAll()
    let groups = all.groups ? [...all.groups] : []

    if (group.id === "fixed") {
      // 内部操作，不检查 name
      const exist = groups.find((g) => g.name === group.name)
      if (exist) {
        throw Error(`already exist same group named ${group.name}`)
      }
    }

    if (!group.id) {
      group.id = nanoid()
    }

    if (group.id === "fixed") {
      groups.unshift(group)
    } else {
      groups.push(group)
    }

    await SyncOptionsStorage.set({ groups })
  },

  async update(info) {
    const all = await SyncOptionsStorage.getAll()
    let groups = all.groups ? [...all.groups] : []

    const exist = groups.find((item) => item.id === info.id)
    if (!exist) {
      throw Error(`cannot find group id is ${info.id}(${info.name})`)
    }

    const existSameName = groups
      .filter((i) => i.id !== info.id)
      .find((item) => item.name === info.name)
    if (existSameName) {
      throw Error(`already exist same group named ${info.name}`)
    }

    Object.assign(exist, info)
    await SyncOptionsStorage.set({ groups })
  },

  async deleteGroup(id) {
    const all = await SyncOptionsStorage.getAll()
    if (!all.groups) {
      return
    }
    const newGroups = all.groups.filter((g) => g.id !== id)
    await SyncOptionsStorage.set({ groups: newGroups })
  },

  async orderGroups(items) {
    const all = await SyncOptionsStorage.getAll()
    if (!all.groups) {
      return
    }
    const newGroups = []
    const fixedGroup = all.groups.find((g) => g.id === "fixed")
    newGroups.push(fixedGroup)

    for (const item of items) {
      if (item.id === "fixed") {
        continue
      }
      const exist = all.groups.find((g) => g.id === item.id)
      if (exist) {
        newGroups.push(exist)
      }
    }

    await SyncOptionsStorage.set({ groups: newGroups })
  }
}

export default GroupOptions
