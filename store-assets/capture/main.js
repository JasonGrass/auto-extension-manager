import en from "../../src/_locales/en/messages.json"
import zhCN from "../../src/_locales/zh_CN/messages.json"

const query = new URLSearchParams(location.search)
const locale = query.get("locale") === "en" ? "en" : "zh_CN"
const page = query.get("page") === "popup" ? "popup" : "options"
const layout = query.get("layout") === "grid" ? "grid" : "list"
const scale = query.get("scale") === "2" ? 2 : 1
const messages = locale === "en" ? en : zhCN
document.documentElement.lang = locale === "en" ? "en" : "zh-CN"
document.documentElement.style.zoom = String(scale)

const event = () => {
  const handlers = new Set()
  return {
    addListener: (fn) => handlers.add(fn),
    removeListener: (fn) => handlers.delete(fn),
    hasListener: (fn) => handlers.has(fn),
    emit: (...args) => handlers.forEach((fn) => fn(...args))
  }
}
const store = { sync: {}, local: {}, session: {} }
const area = (name) => ({
  QUOTA_BYTES: 102400,
  QUOTA_BYTES_PER_ITEM: 8192,
  get(keys, callback) {
    const source = store[name]
    const result =
      keys === null || keys === undefined
        ? { ...source }
        : typeof keys === "string"
          ? { [keys]: source[keys] }
          : Array.isArray(keys)
            ? Object.fromEntries(
                keys.filter((key) => key in source).map((key) => [key, source[key]])
              )
            : Object.fromEntries(Object.keys(keys).map((key) => [key, source[key] ?? keys[key]]))
    callback?.(result)
    return Promise.resolve(result)
  },
  set(values, callback) {
    Object.assign(store[name], values)
    callback?.()
    chrome.storage.onChanged.emit(values, name)
    return Promise.resolve()
  },
  clear(callback) {
    store[name] = {}
    callback?.()
    return Promise.resolve()
  },
  remove(keys, callback) {
    for (const key of [].concat(keys)) delete store[name][key]
    callback?.()
    return Promise.resolve()
  },
  getBytesInUse: async () => JSON.stringify(store[name]).length
})

const names = [
  ["Focus Notes", "FN", "#4f6df5", true],
  ["Tab Garden", "TG", "#16a5a3", true],
  ["Page Palette", "PP", "#e4748c", true],
  ["Quick Translate", "QT", "#8c63cb", true],
  ["Reading Shelf", "RS", "#e4a643", false],
  ["Code Compass", "CC", "#267eae", true],
  ["Calm Timer", "CT", "#7baf6d", false],
  ["Clip Studio", "CS", "#da7955", true]
]
const icon = (initials, color) =>
  `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><rect width="128" height="128" rx="28" fill="${color}"/><circle cx="96" cy="32" r="16" fill="white" opacity=".14"/><text x="64" y="76" fill="white" text-anchor="middle" font-family="Arial,sans-serif" font-size="39" font-weight="700">${initials}</text></svg>`)}`
const extensions = names.map(([name, initials, color, enabled], index) => ({
  id: String.fromCharCode(97 + index).repeat(32),
  name,
  shortName: name,
  description: `${name} helps keep your browsing organized.`,
  version: `1.${index + 2}.0`,
  type: "extension",
  installType: "normal",
  enabled,
  mayDisable: true,
  isApp: false,
  permissions: [],
  hostPermissions: [],
  homepageUrl: `https://example.invalid/${name.toLowerCase().replaceAll(" ", "-")}`,
  icons: [{ size: 128, url: icon(initials, color) }],
  icon: icon(initials, color)
}))
const self = { id: "p".repeat(32), name: "Extension Manager", optionsUrl: "#" }
const managementEvents = Object.fromEntries(
  ["onEnabled", "onDisabled", "onInstalled", "onUninstalled"].map((key) => [key, event()])
)
const reply = (value, callback) => {
  callback?.(value)
  return Promise.resolve(value)
}

globalThis.chrome = {
  i18n: {
    getMessage(key, substitutions) {
      let result = messages[key]?.message ?? ""
      const args = Array.isArray(substitutions) ? substitutions : [substitutions]
      args.forEach((value, index) => {
        if (value != null) result = result.replaceAll(`$${index + 1}`, String(value))
      })
      return result
    },
    getUILanguage: () => locale
  },
  storage: {
    sync: area("sync"),
    local: area("local"),
    session: area("session"),
    onChanged: event()
  },
  management: {
    ...managementEvents,
    getAll: (callback) =>
      reply(
        extensions.map((ext) => ({ ...ext })),
        callback
      ),
    getSelf: (callback) => reply(self, callback),
    get: (id, callback) =>
      reply(
        extensions.find((ext) => ext.id === id),
        callback
      ),
    setEnabled: (id, enabled, callback) => {
      const extension = extensions.find((ext) => ext.id === id)
      if (extension) {
        extension.enabled = enabled
        managementEvents[enabled ? "onEnabled" : "onDisabled"].emit(extension)
      }
      return reply(undefined, callback)
    },
    uninstall: (_id, callback) => reply(undefined, callback),
    launchApp: (_id, callback) => reply(undefined, callback)
  },
  runtime: {
    id: self.id,
    lastError: null,
    getManifest: () => ({ version: "4.0.0", name: "Extension Manager" }),
    getURL: (value) => new URL(value, location.href).href,
    getPlatformInfo: (callback) => reply({ os: "win", arch: "x86-64" }, callback),
    sendMessage: (_message, callback) => reply({}, callback),
    onMessage: event(),
    onInstalled: event(),
    onStartup: event()
  },
  tabs: {
    create: (_details, callback) => reply({}, callback),
    query: (_details, callback) => reply([], callback),
    get: (_id, callback) => reply({}, callback),
    reload: (_id, callback) => reply(undefined, callback),
    onUpdated: event(),
    onActivated: event(),
    onRemoved: event()
  },
  windows: { getAll: (callback) => reply([], callback), onFocusChanged: event() }
}

const groups = [
  { id: "fixed", name: "Fixed", desc: "", extensions: [extensions[0].id] },
  {
    id: "work",
    name: locale === "en" ? "Work" : "工作",
    desc: "",
    extensions: [0, 1, 3, 5, 7].map((i) => extensions[i].id)
  },
  {
    id: "study",
    name: locale === "en" ? "Study" : "学习",
    desc: "",
    extensions: [0, 3, 4].map((i) => extensions[i].id)
  },
  {
    id: "leisure",
    name: locale === "en" ? "Leisure" : "休闲",
    desc: "",
    extensions: [1, 2, 6].map((i) => extensions[i].id)
  },
  { id: "hidden", name: "Hidden", desc: "", extensions: [] }
]
const scenes = [
  {
    id: "work",
    name: locale === "en" ? "Work" : "工作",
    desc: locale === "en" ? "Tools for a productive day" : "高效完成日常工作"
  },
  {
    id: "study",
    name: locale === "en" ? "Study" : "学习",
    desc: locale === "en" ? "Read, collect and learn" : "阅读、收集与学习"
  },
  {
    id: "leisure",
    name: locale === "en" ? "Leisure" : "休闲",
    desc: locale === "en" ? "A lighter browsing session" : "轻松浏览，享受闲暇"
  }
]
const trigger = (type, config) => ({ trigger: type, config })
const rule = (id, triggers, groups, targetIds, actionType, enable = true) => ({
  id,
  version: 2,
  enable,
  match: { relationship: "and", triggers },
  target: { groups, extensions: targetIds.map((i) => extensions[i].id) },
  action: { actionType }
})
const rules = [
  rule(
    "rule-work",
    [trigger("urlTrigger", { matchMethod: "wildcard", matchUrl: ["workspace.example"] })],
    ["work"],
    [],
    "openWhenMatched"
  ),
  rule(
    "rule-work-scene",
    [trigger("sceneTrigger", { sceneIds: ["work"] })],
    [],
    [0, 6],
    "openOnlyWhenMatched"
  ),
  rule(
    "rule-study",
    [trigger("urlTrigger", { matchMethod: "wildcard", matchUrl: ["academy.example"] })],
    ["study"],
    [],
    "openWhenMatched"
  ),
  rule("rule-windows", [trigger("osTrigger", { os: ["win"] })], [], [5], "openWhenMatched"),
  rule(
    "rule-evening",
    [trigger("periodTrigger", { periods: [{ start: "19:00", end: "22:00" }] })],
    ["leisure"],
    [],
    "openWhenMatched"
  )
]
const options = {
  groups,
  scenes,
  ruleConfig: rules,
  setting: {
    layout,
    darkMode: "light",
    isDisplayByGroup: layout !== "grid",
    isShowApp: false,
    isShowItemOperationAlways: true,
    isShowSearchBarDefault: true,
    isShowFixedExtension: true,
    isShowAppNameInGirdView: true,
    columnCountInGirdView: 6,
    zoomRatio: 100,
    defaultSortField: "name"
  },
  management: { extensions: [] }
}

async function start() {
  const [{ default: storage }, { LocalOptions }, { ExtensionRepo }, { HistoryRepo }] =
    await Promise.all([
      import("../../src/storage/sync"),
      import("../../src/storage/local/LocalOptions"),
      import("../../src/pages/Background/extension/ExtensionRepo"),
      import("../../src/pages/Background/history/HistoryRepo")
    ])
  await storage.options.setAll(options)
  const local = new LocalOptions()
  await local.setActiveSceneIds(["work"])
  await local.setActiveGroupId("")
  await local.setNeedBuildExtensionIcon(false)
  const extRepo = new ExtensionRepo()
  for (const ext of extensions)
    await extRepo.set({ ...ext, recordUpdateTime: Date.now(), state: "install" })
  const history = new HistoryRepo()
  await history.clearAll()
  const now = new Date("2026-09-27T10:30:00+08:00").getTime()
  const historyEvents = [
    "enabled",
    "disabled",
    "updated",
    "install",
    "enabled",
    "disabled",
    "uninstall",
    "updated"
  ]
  for (let index = 0; index < historyEvents.length; index++) {
    // The older uninstall is followed by an install of the same extension.
    const ext = extensions[index === 6 ? 3 : index]
    const event = historyEvents[index]
    const automatic = event === "enabled" || event === "disabled"
    const ruleId = index === 4 ? "rule-study" : "rule-work"
    await history.add({
      timestamp: now - index * 3600000,
      event,
      extensionId: ext.id,
      icon: ext.icon,
      name: ext.name,
      version: ext.version,
      remark: automatic ? (index === 4 ? "academy.example" : "workspace.example") : "",
      ruleId: automatic ? ruleId : "",
      groupId: ""
    })
  }
  const seeded = await storage.options.getAll()
  if (seeded.groups.length !== groups.length || seeded.ruleConfig.length !== rules.length) {
    throw new Error("Capture configuration seed failed")
  }
  document.title = `Capture ready · ${locale} · ${page} · ${layout} · ${scale}x`
  window.__captureReady = {
    locale,
    page,
    layout,
    scale,
    extensions: extensions.length,
    rules: rules.length
  }
  if (page === "popup") await import("../../src/pages/Popup/index.jsx")
  else await import("../../src/pages/Options/index.jsx")
}

start().catch((error) => {
  console.error("Capture startup failed", error)
  document.title = "Capture startup failed"
  document.getElementById("app-container").textContent = `Capture startup failed: ${error.message}`
})
