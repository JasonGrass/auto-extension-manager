import { nanoid } from "nanoid"

import { SyncOptionsStorage } from "./options-storage"
import { LocalOptionsStorage } from "./options-storage"

export const SceneOptions = {
  async getActive() {
    const all = await LocalOptionsStorage.getAll()
    let scene = all.scene ? { ...all.scene } : {}
    return scene.activeId
  },

  async setActive(id) {
    const all = await LocalOptionsStorage.getAll()
    let scene = all.scene ? { ...all.scene } : {}
    scene.activeId = id
    await LocalOptionsStorage.set({ scene })
  },

  async getAll() {
    const all = await SyncOptionsStorage.getAll()
    let scenes = all.scenes ? [...all.scenes] : []
    return scenes
  },

  async addOne(info) {
    const all = await SyncOptionsStorage.getAll()
    let scenes = all.scenes ? [...all.scenes] : []

    const exist = scenes.find((item) => item.name === info.name)
    if (exist) {
      throw Error(`already exist same scene named ${info.name}`)
    }

    if (!info.id) {
      info.id = nanoid()
    }

    scenes.push(info)

    await SyncOptionsStorage.set({ scenes })
  },

  async update(info) {
    const all = await SyncOptionsStorage.getAll()
    let scenes = all.scenes ? [...all.scenes] : []
    const exist = scenes.find((item) => item.id === info.id)
    if (!exist) {
      throw Error(`cannot find scene id is ${info.id}(${info.name})`)
    }

    const existSameName = scenes
      .filter((i) => i.id !== info.id)
      .find((item) => item.name === info.name)
    if (existSameName) {
      throw Error(`already exist same scene named ${info.name}`)
    }

    Object.assign(exist, info)
    await SyncOptionsStorage.set({ scenes })
  },

  async deleteOne(id) {
    const all = await SyncOptionsStorage.getAll()
    if (!all.scenes) {
      return
    }
    const leftScenes = all.scenes.filter((item) => item.id !== id)
    await SyncOptionsStorage.set({ scenes: leftScenes })
  }
}

export default SceneOptions
