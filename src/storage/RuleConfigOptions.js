import { List, Map } from "immutable"
import { nanoid } from "nanoid"

import ConvertRuleToV2 from ".../pages/Background/rule/RuleConverter"
import { SyncOptionsStorage } from "./options-storage"

export const RuleConfigOptions = {
  async get() {
    const all = await SyncOptionsStorage.getAll()
    const configs = all.ruleConfig ?? []

    return configs.map((c) => ConvertRuleToV2(c)).filter((c) => c)
  },

  async addOne(config) {
    let configs = await this.get()

    if (!config.id) {
      config.id = nanoid()
    }

    configs.push(config)

    await SyncOptionsStorage.set({ ruleConfig: configs })
  },

  async update(config) {
    let configs = await this.get()

    const exist = configs.find((item) => item.id === config.id)
    if (!exist) {
      throw Error(`cannot find config id is ${config.id})`)
    }

    Object.assign(exist, config)

    await SyncOptionsStorage.set({ ruleConfig: configs })
  },

  async duplicate(config) {
    let configs = await this.get()
    const exist = configs.find((item) => item.id === config.id)
    if (!exist) {
      throw Error(`cannot find config id is ${config.id})`)
    }

    const newConfig = Map(exist).set("id", nanoid()).toJS()
    configs.splice(configs.indexOf(exist), 0, newConfig)

    await SyncOptionsStorage.set({ ruleConfig: configs })
  },

  async deleteOne(id) {
    const all = await SyncOptionsStorage.getAll()
    if (!all.scenes) {
      return
    }

    const leftConfigs = all.ruleConfig.filter((item) => item.id !== id)
    await SyncOptionsStorage.set({ ruleConfig: leftConfigs })
  }
}

export default RuleConfigOptions
