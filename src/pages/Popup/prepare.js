import localforage from "localforage"

import { attachCachedExtensionIcons } from ".../pages/Background/extension/ExtensionRepo"
import { loadPopupGroupFolds } from ".../pages/Popup/utils/popupGroupFolds"
import { applyPopupWidth } from ".../pages/Popup/utils/popupLayoutHelper"
import { LocalOptions } from ".../storage/local"
import storage from ".../storage/sync"
import { resolveActiveSceneIds } from ".../storage/sync/SceneOptions"
import {
  applyThemeToDocument,
  captureThemePreference,
  darkTheme,
  getThemePreference,
  lightTheme
} from ".../styles/themes"
import { appendAdditionInfo, isExtExtension } from ".../utils/extensionHelper"
import { buildNoGroup } from "./utils/popupGroupHelper"

const forage = localforage.createInstance({
  driver: localforage.LOCALSTORAGE,
  name: "TempCache",
  version: 1.0,
  storeName: "options"
})

export async function prepare() {
  const themePreference = captureThemePreference(chrome.storage.onChanged)
  try {
    const local = new LocalOptions()
    const optionsPromise = getOptions()
    const extensionsPromise = chrome.management
      .getAll()
      .then((extensions) =>
        extensions.filter(
          (extension) => extension.type !== "theme" && extension.id !== chrome.runtime.id
        )
      )
    // Start optional icons immediately. Use them on the first frame when already ready,
    // but do not hold the entire popup behind a slow cache record.
    let cachedExtensions
    const iconEnhancement = extensionsPromise
      .then(attachCachedExtensionIcons)
      .then((extensions) => {
        cachedExtensions = extensions
        return extensions
      })
      .catch((error) => {
        console.warn("Unable to read popup icon cache", error)
        return []
      })
    const [options, extensions, groupId, storedSceneIds, initialFoldedGroups] = await Promise.all([
      optionsPromise,
      extensionsPromise,
      local.getActiveGroupId().catch(() => null),
      local.getActiveSceneIds().catch(() => []),
      optionsPromise.then((options) =>
        options.setting.isDisplayByGroup ? loadPopupGroupFolds() : {}
      )
    ])
    const activeSceneIds = await resolveActiveSceneIds(storedSceneIds, options.scenes, local)
    const groups = storage.helper.formatGroups(options.groups)
    const visibleGroups = groups.filter(
      (group) => group.id !== "hidden" || options.setting.isShowHiddenExtension
    )
    const noGroup = buildNoGroup(
      extensions.filter(isExtExtension),
      groups,
      chrome.i18n.getMessage("group_no_group_name")
    )
    const initialGroup = [...visibleGroups, noGroup].find((group) => group.id === groupId) ?? null
    if (groupId && !initialGroup) {
      void local.setActiveGroupId(null).catch((error) => {
        console.warn("Unable to reset deleted popup group", error)
      })
    }
    themePreference.mode = options.setting.darkMode
    return {
      extensions: appendAdditionInfo(cachedExtensions ?? extensions, options.management),
      options,
      params: {
        initialGroup,
        activeSceneIds,
        initialFoldedGroups,
        iconEnhancement,
        themePreference
      }
    }
  } catch (error) {
    themePreference.dispose()
    throw error
  }
}

function applyPopupShell(options) {
  if (!options?.setting) return
  const { setting } = options
  applyPopupWidth(setting.layout, 0, setting.columnCountInGirdView, setting.zoomRatio)
  document.body.style.height = "auto"
  const ratio = Number(setting.zoomRatio)
  document.body.style.zoom = Number.isFinite(ratio) && ratio > 0 ? ratio / 100 : 1
  document.documentElement.style.setProperty(
    "--header-height",
    setting.isShowSearchBarDefault ? "72px" : "42px"
  )
  const { isDarkMode } = getThemePreference(
    setting.darkMode,
    window.matchMedia("(prefers-color-scheme: dark)").matches
  )
  applyThemeToDocument(isDarkMode ? darkTheme : lightTheme, isDarkMode)
}

async function getOptions() {
  let authoritative = false
  // Cache is only a hint for the window's initial appearance. Actions and scene
  // cleanup always use fresh configuration, including changes synced elsewhere.
  void forage
    .getItem("all_options")
    .then((cached) => {
      if (!authoritative) applyPopupShell(cached)
    })
    .catch((error) => console.warn("Unable to read popup display cache", error))
  const options = await storage.options.getAll()
  authoritative = true
  applyPopupShell(options)
  void forage.setItem("all_options", options).catch((error) => {
    console.warn("Unable to update popup display cache", error)
  })
  return options
}
