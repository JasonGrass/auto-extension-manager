import OptionsStorage from "./options-storage"

export const ManageOptions = {
  /**
   * 获取所有管理相关的配置
   */
  async get() {
    const all = await OptionsStorage.getAll()
    const configs = all.management ?? {}
    return configs
  },

  /**
   * 更新具体扩展的相关配置
   * @param {*} extId 扩展ID
   * @param {*} configs 具体配置对象
   */
  async updateExtension(extId, configs) {
    const all = await this.get()
    let extConfigs = all.extensions ?? []
    const one = extConfigs.filter((item) => item.extId === extId)[0]
    configs.update_time = new Date().getTime()
    if (one) {
      Object.assign(one, configs)
    } else {
      extConfigs.push({ extId, ...configs })
    }

    all.extensions = extConfigs
    await OptionsStorage.set({ management: all })
  }
}
