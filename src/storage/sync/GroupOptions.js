import { nanoid } from "nanoid"

import { getLang } from ".../utils/utils"
import { SyncOptionsStorage } from "./options-storage"

export const GroupOptions = {
  async getGroups() {
    const all = await SyncOptionsStorage.getAll()
    let groups = all.groups ? [...all.groups] : []

    if (!groups.find((g) => g.id === "fixed")) {
      const fixedGroup = {
        id: "fixed",
        name: "__fixed_group__",
        extensions: []
      }
      groups.unshift(fixedGroup)
      await this.addGroup(fixedGroup)
    }

    if (!groups.find((g) => g.id === "hidden")) {
      const hiddenGroup = {
        id: "hidden",
        name: "__hidden_group__",
        extensions: []
      }
      groups.unshift(hiddenGroup)
      await this.addGroup(hiddenGroup)
    }

    return groups
  },

  async addGroup(group) {
    const all = await SyncOptionsStorage.getAll()
    let groups = all.groups ? [...all.groups] : []

    const exist = groups.find((g) => g.name === group.name)
    if (exist) {
      throw Error(`[Add Group] Already exist same group named ${group.name}`)
    }

    if (group.id) {
      const exist = groups.find((g) => g.id === group.id)
      if (exist) {
        throw Error(`[Add Group] Already exist same group id is ${group.id}`)
      }
    } else {
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
    if (fixedGroup) {
      newGroups.push(fixedGroup)
    }
    const hiddenGroup = all.groups.find((g) => g.id === "hidden")
    if (hiddenGroup) {
      newGroups.push(hiddenGroup)
    }

    for (const item of items) {
      if (item.id === "fixed" || item.id === "hidden") {
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

export const formatGroups = (groups) => {
  if (!groups) {
    return []
  }
  return groups.map((g) => {
    if (g.id === "fixed") {
      g.name = getLang("group_fixed_name")
    }
    if (g.id === "hidden") {
      g.name = getLang("group_hidden_name")
    }

    if (!g.extensions) {
      g.extensions = []
    }

    return g
  })
}

export const isSpecialGroup = (group) => {
  if (!group) {
    return false
  }

  if (typeof group === "string") {
    return group === "fixed" || group === "hidden"
  }

  return group.id === "fixed" || group.id === "hidden"
}
