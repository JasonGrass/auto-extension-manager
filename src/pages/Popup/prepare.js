import localforage from "localforage"

import { getPopupHeight, getPopupWidth } from ".../pages/Popup/utils/popupLayoutHelper"
import storage from ".../storage/sync"
import { appendAdditionInfo } from ".../utils/extensionHelper"

const forage = localforage.createInstance({
  driver: localforage.LOCALSTORAGE,
  name: "TempCache",
  version: 1.0,
  storeName: "options"
})

export const prepare = async function () {
  const allOptions = await getOptions()

  const extensions = await getShownExtensions(allOptions)

  // popup 宽度设置
  document.body.style.width = getPopupWidth(
    allOptions.setting.layout,
    extensions.length,
    allOptions.setting.columnCountInGirdView
  )

  // popup 高度设置
  // 分组数量
  // const groupCount = allOptions.setting.isDisplayByGroup
  //   ? allOptions.groups.length
  //   : 3 /*启用+禁用+置顶*/
  // document.body.style.height = getPopupHeight(
  //   allOptions.setting.layout,
  //   extensions.length,
  //   allOptions.setting.columnCountInGirdView,
  //   groupCount
  // )

  document.body.style.height = "auto"

  let zoom = 1
  if (allOptions.setting.zoomRatio) {
    zoom = allOptions.setting.zoomRatio / 100
  }

  document.body.style.zoom = zoom

  return {
    // 插件信息
    extensions: extensions,
    // 用户配置信息
    options: allOptions,
    // 运行时临时参数
    params: {}
  }
}

/**
 * 获取要显示的扩展
 */
async function getShownExtensions(allOptions) {
  let allExtensions = await chrome.management.getAll()

  // 如果关闭了在 Popup 中显示固定分组中的扩展，则隐藏这些扩展
  if (!(allOptions.setting.isShowFixedExtension ?? true)) {
    const fixedGroup = allOptions.groups.find((g) => g.id === "fixed")
    if (fixedGroup && fixedGroup.extensions) {
      allExtensions = allExtensions.filter((ext) => !fixedGroup.extensions.includes(ext.id))
    }
  }

  // 不展示主题类的扩展，不展示自己
  const selfId = await getSelfId()
  allExtensions = allExtensions
    .filter((ext) => ext.type !== "theme")
    .filter((ext) => ext.id !== selfId)

  // 填充附加信息
  const extensions = appendAdditionInfo(allExtensions, allOptions.management)

  return extensions
}

/**
 * 获取所有配置信息，优先从缓存中读取
 */
async function getOptions() {
  const cacheOptions = await forage.getItem("all_options")
  if (!cacheOptions) {
    const allOptions = await storage.options.getAll()
    await forage.setItem("all_options", allOptions)
    return allOptions
  } else {
    // 更新缓存的配置信息
    setTimeout(async () => {
      const allOptions = await storage.options.getAll()
      await forage.setItem("all_options", allOptions)
      console.log("update cache all_options")
    }, 3000)
    return cacheOptions
  }
}

/**
 * 获取自身的扩展ID，优先从缓存中读取
 */
async function getSelfId() {
  const selfId = await forage.getItem("self_id")
  if (selfId) {
    return selfId
  }

  const self = await chrome.management.getSelf()
  await forage.setItem("self_id", self.id)
  return self.id
}
