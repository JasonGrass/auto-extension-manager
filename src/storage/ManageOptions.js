import { SyncOptionsStorage } from "./options-storage"

export const ManageOptions = {
  /**
   * 获取所有管理相关的配置
   */
  async get() {
    const all = await SyncOptionsStorage.getAll()
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

    all.extensions = extConfigs.filter((c) => !isEmptyConfig(c))
    await SyncOptionsStorage.set({ management: all })
  }
}

// 判断对扩展的额外配置（如别名，备注等）是否为空
function isEmptyConfig(extensionConfig) {
  if (!extensionConfig) {
    return true
  }

  const config = { ...extensionConfig }
  delete config.extId
  delete config.update_time

  // 还有值的配置
  const valueConfigs = Object.keys(config)
    .filter((key) => {
      return config[key]
    })
    .filter(Boolean)

  // 如果没有任何值了，则为一个空配置
  return valueConfigs.length === 0
}
