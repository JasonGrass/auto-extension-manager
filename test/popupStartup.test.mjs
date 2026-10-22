import assert from "node:assert/strict"
import { test } from "node:test"

import { createSourceLoader, deferred, flush } from "./helpers/loadSource.mjs"

function harness({ cached, cacheError = false, iconsPending = false } = {}) {
  const calls = []
  const options = deferred()
  const extensions = deferred()
  const icons = deferred()
  const themeListeners = new Set()
  const storageChanges = {
    addListener: (listener) => themeListeners.add(listener),
    removeListener: (listener) => themeListeners.delete(listener)
  }
  const local = {
    getActiveGroupId: async () => "work",
    getActiveSceneIds: async () => ["active", "deleted"],
    setActiveGroupId: async () => {}
  }
  const document = {
    documentElement: { style: { setProperty() {} } },
    body: { style: {} }
  }
  const load = createSourceLoader(
    {
      localforage: {
        LOCALSTORAGE: "local",
        createInstance: () => ({
          async getItem(key) {
            if (cacheError) throw new Error("Cache unavailable")
            return key === "self_id" ? "self" : cached
          },
          async setItem() {
            if (cacheError) throw new Error("Cache unavailable")
          }
        })
      },
      ".../storage/sync": {
        options: {
          getAll() {
            calls.push("options")
            return options.promise
          }
        },
        helper: { formatGroups: (groups) => groups }
      },
      ".../storage/local": {
        LocalOptions: class {
          constructor() {
            return local
          }
        }
      },
      ".../storage/sync/SceneOptions": {
        resolveActiveSceneIds: async (ids, scenes) =>
          ids.filter((id) => scenes.some((scene) => scene.id === id))
      },
      ".../pages/Background/extension/ExtensionRepo": {
        attachCachedExtensionIcons(items) {
          calls.push("icons")
          return iconsPending ? icons.promise : Promise.resolve(items)
        }
      },
      ".../pages/Popup/utils/popupGroupFolds": {
        loadPopupGroupFolds: async () => {
          calls.push("folds")
          return { work: true }
        }
      },
      ".../pages/Popup/utils/popupLayoutHelper": {
        applyPopupWidth: () => calls.push("layout")
      },
      ".../utils/extensionHelper": {
        appendAdditionInfo: (items) => items,
        isExtExtension: (item) => item.type === "extension"
      }
    },
    {
      chrome: {
        runtime: { id: "self" },
        storage: { onChanged: storageChanges },
        i18n: { getMessage: (key) => key },
        management: {
          getAll() {
            calls.push("extensions")
            return extensions.promise
          }
        }
      },
      document,
      window: { matchMedia: () => ({ matches: false }) },
      console: { warn() {}, error() {}, log() {} },
      setTimeout() {}
    }
  )
  return {
    prepare: load("src/pages/Popup/prepare.js").prepare,
    options,
    extensions,
    icons,
    calls,
    document,
    themes: load("src/styles/themes.js"),
    storageChanges,
    themeListeners,
    storage(changes, area = "sync") {
      for (const listener of themeListeners) listener(changes, area)
    }
  }
}

const freshOptions = () => ({
  setting: { darkMode: "dark", layout: "grid", zoomRatio: 110, isDisplayByGroup: true },
  groups: [{ id: "work", name: "Work", extensions: ["a"] }],
  scenes: [{ id: "active", name: "Active" }],
  management: { extensions: [] },
  ruleConfig: []
})
const installed = [
  { id: "self", type: "extension", version: "1" },
  { id: "theme", type: "theme", version: "1" },
  { id: "a", type: "extension", version: "1", enabled: true }
]

test("popup starts authoritative configuration and installed-extension reads together", async () => {
  const h = harness()
  const ready = h.prepare()
  await flush()
  assert.ok(h.calls.includes("options"))
  assert.ok(h.calls.includes("extensions"))
  h.options.resolve(freshOptions())
  h.extensions.resolve(installed)
  await ready
})

test("popup uses fresh configuration and restores the initial group, scenes and folds", async () => {
  const h = harness({ cached: { ...freshOptions(), setting: { darkMode: "light" } } })
  const ready = h.prepare()
  h.options.resolve(freshOptions())
  h.extensions.resolve(installed)
  const result = await ready
  assert.equal(result.options.setting.darkMode, "dark")
  assert.deepEqual(
    result.extensions.map((item) => item.id),
    ["a"]
  )
  assert.equal(result.params.initialGroup.id, "work")
  assert.deepEqual(result.params.activeSceneIds, ["active"])
  assert.deepEqual(result.params.initialFoldedGroups, { work: true })
  assert.equal(h.document.body.style.zoom, 1.1)
})

test("slow optional icon caches do not prevent the core popup from becoming ready", async () => {
  const h = harness({ iconsPending: true })
  let result
  const ready = h.prepare().then((value) => (result = value))
  h.options.resolve(freshOptions())
  h.extensions.resolve(installed)
  await flush()
  assert.ok(result, "core data must be usable before all cached icons finish")
  h.icons.resolve([{ ...installed[2], icon: "cached" }])
  assert.equal((await result.params.iconEnhancement)[0].icon, "cached")
  await ready
})

test("unavailable display caches do not discard successfully loaded core data", async () => {
  const h = harness({ cacheError: true })
  const ready = h.prepare()
  h.options.resolve(freshOptions())
  h.extensions.resolve(installed)
  assert.equal((await ready).extensions[0].id, "a")
})

test("a core read failure rejects promptly while optional cache work is pending", async () => {
  const h = harness({ iconsPending: true })
  const ready = h.prepare()
  assert.equal(h.themeListeners.size, 1)
  h.options.reject(new Error("Configuration unavailable"))
  h.extensions.resolve(installed)
  await assert.rejects(ready, /Configuration unavailable/)
  assert.equal(h.themeListeners.size, 0)
  h.icons.resolve([])
})

function observePreparedTheme(h, prepared, readMode) {
  const states = []
  const mediaQuery = new EventTarget()
  mediaQuery.matches = false
  const observer = h.themes.observeThemePreference({
    initialPreference: prepared.params.themePreference,
    mediaQuery,
    storageChanges: h.storageChanges,
    readMode,
    onChange: (state) => states.push(state)
  })
  return { ...observer, states }
}

test("unchanged popup theme hands off its listener without another options read", async () => {
  const h = harness()
  const ready = h.prepare()
  h.storage({ activeSceneIds: {} }, "local")
  h.storage({ "LS__groups.0": {} })
  h.options.resolve(freshOptions())
  h.extensions.resolve(installed)
  const prepared = await ready
  assert.equal(h.themeListeners.size, 1)
  let reads = 0
  const view = observePreparedTheme(h, prepared, async () => {
    reads++
    return "light"
  })
  assert.equal(h.themeListeners.size, 1)
  await flush()
  assert.deepEqual(view.states, [{ mode: "dark", isDarkMode: true }])
  assert.equal(reads, 0)
  view.dispose()
  assert.equal(h.themeListeners.size, 0)
})

for (const timing of ["during the options read", "while management is still loading"]) {
  test(`popup theme catches a setting change ${timing}`, async () => {
    const h = harness()
    const ready = h.prepare()
    if (timing === "while management is still loading") {
      h.options.resolve(freshOptions())
      await flush()
    }
    h.storage({ "LS__setting.0": { newValue: "changed settings" } })
    h.options.resolve(freshOptions())
    h.extensions.resolve(installed)
    const prepared = await ready
    let reads = 0
    const view = observePreparedTheme(h, prepared, async () => {
      reads++
      return "light"
    })
    await flush()
    assert.deepEqual(view.states.at(-1), { mode: "light", isDarkMode: false })
    assert.equal(reads, 1)
    assert.equal(h.themeListeners.size, 1)
    view.dispose()
    assert.equal(h.themeListeners.size, 0)
  })
}

test("a popup without grouped display skips unused fold-state storage", async () => {
  const h = harness()
  const ready = h.prepare()
  const options = freshOptions()
  options.setting.isDisplayByGroup = false
  h.options.resolve(options)
  h.extensions.resolve(installed)
  await ready
  assert.equal(h.calls.includes("folds"), false)
})
