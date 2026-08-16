import { nanoid } from "nanoid"

import { LocalOptions } from "../local/LocalOptions"
import { normalizeActiveSceneIds, updateActiveSceneIds } from "../local/activeSceneState"
import { SyncOptionsStorage } from "./options-storage"

export const SceneOptions = {
  /** @deprecated Use getActiveIds for multi-scene aware code. */
  async getActive() {
    const ids = await this.getActiveIds()
    return ids.length > 0 ? ids[ids.length - 1] : ""
  },

  /** @deprecated Use setActiveIds for multi-scene aware code. */
  async setActive(id) {
    await this.setActiveIds(id ? [id] : [])
  },

  /** Return active IDs after removing references to scenes that no longer exist. */
  async getActiveIds() {
    const local = new LocalOptions()
    const [storedIds, scenes] = await Promise.all([local.getActiveSceneIds(), this.getAll()])
    const existingIds = new Set(scenes.map((scene) => scene.id))
    const activeIds = storedIds.filter((id) => existingIds.has(id))

    // Clean up IDs of deleted scenes once they are observed at the domain-storage boundary.
    if (activeIds.length !== storedIds.length) {
      await local.setActiveSceneIds(activeIds)
    }
    return activeIds
  },

  /** Persist a normalized collection and return the canonical value used by UI and rules. */
  async setActiveIds(ids) {
    const local = new LocalOptions()
    const normalized = normalizeActiveSceneIds(ids)
    await local.setActiveSceneIds(normalized)
    return normalized
  },

  /** Apply one toggle; exclusivity affects activation only, never deactivation. */
  async setActiveState(id, active, exclusive = false) {
    const currentIds = await this.getActiveIds()
    const nextIds = updateActiveSceneIds(currentIds, id, active, exclusive)
    await this.setActiveIds(nextIds)
    return nextIds
  },

  async getAll() {
    const all = await SyncOptionsStorage.getAll()
    const scenes = all.scenes ? [...all.scenes] : []
    return scenes
  },

  async addOne(info) {
    const all = await SyncOptionsStorage.getAll()
    const scenes = all.scenes ? [...all.scenes] : []

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
    const scenes = all.scenes ? [...all.scenes] : []
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

    // Deleting an active scene must also update runtime state; callers use the return value to notify rules.
    const local = new LocalOptions()
    const activeIds = (await local.getActiveSceneIds()).filter((activeId) => activeId !== id)
    await local.setActiveSceneIds(activeIds)
    return activeIds
  },

  async orderScenes(items) {
    if (!items) {
      return
    }
    const all = await this.getAll()
    const newScenes = []

    for (const item of items) {
      const exist = all.find((s) => s.id === item.id)
      if (exist) {
        newScenes.push(exist)
      }
    }

    await SyncOptionsStorage.set({ scenes: newScenes })
  }
}

export default SceneOptions
