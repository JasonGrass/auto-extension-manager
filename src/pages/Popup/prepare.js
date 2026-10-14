import localforage from "localforage"

import { attachCachedExtensionIcons } from ".../pages/Background/extension/ExtensionRepo"
import { applyPopupWidth } from ".../pages/Popup/utils/popupLayoutHelper"
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
  applyPopupWidth(
    allOptions.setting.layout,
    extensions.length,
    allOptions.setting.columnCountInGirdView,
    allOptions.setting.zoomRatio
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

  // 获取当前标签页 URL，用于快速创建规则
  const currentTabUrl = await getCurrentTabUrl()

  return {
    // 插件信息
    extensions: extensions,
    // 用户配置信息
    options: allOptions,
    // 运行时临时参数
    params: {
      currentTabUrl: currentTabUrl
    }
  }
}

/**
 * 获取当前活跃标签页的 URL
 */
async function getCurrentTabUrl() {
  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true })
    const url = tabs[0]?.url
    if (!url) {
      return null
    }
    // 排除浏览器内部页面
    if (url.startsWith("chrome://") || url.startsWith("edge://") || url.startsWith("about:")) {
      return null
    }
    return url
  } catch {
    return null
  }
}

/**
 * 获取要显示的扩展
 */
async function getShownExtensions(allOptions) {
  let allExtensions = await chrome.management.getAll()

  // 不展示主题类的扩展，不展示自己
  const selfId = await getSelfId()
  allExtensions = allExtensions
    .filter((ext) => ext.type !== "theme")
    .filter((ext) => ext.id !== selfId)

  allExtensions = await attachCachedExtensionIcons(allExtensions)

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
