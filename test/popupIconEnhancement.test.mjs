import assert from "node:assert/strict"
import { test } from "node:test"

import { createSourceLoader } from "./helpers/loadSource.mjs"

function loadRepo(records) {
  return createSourceLoader({
    localforage: {
      INDEXEDDB: "idb",
      createInstance: () => ({
        async getItem(id) {
          if (records[id] instanceof Error) throw records[id]
          return records[id] ?? null
        }
      })
    }
  })("src/pages/Background/extension/ExtensionRepo.ts")
}

test("one unreadable icon cache preserves usable extensions and other cached icons", async () => {
  const { attachCachedExtensionIcons } = loadRepo({
    a: new Error("Unreadable record"),
    b: {
      id: "b",
      version: "1",
      icon: "data:b",
      iconSource: "manifest",
      iconCacheVersion: 3
    }
  })
  const result = await attachCachedExtensionIcons([
    { id: "a", version: "1", enabled: false },
    { id: "b", version: "1", enabled: true }
  ])
  assert.equal(result[0].enabled, false)
  assert.equal(result[1].icon, "data:b")
})

test("late icon enhancement changes only matching-version icon fields", () => {
  const { mergeCachedExtensionIcons } = loadRepo({})
  const current = [
    { id: "a", version: "1", enabled: false, name: "Current" },
    { id: "b", version: "2", enabled: true },
    { id: "new", version: "1", enabled: true }
  ]
  const result = mergeCachedExtensionIcons(current, [
    { id: "a", version: "1", enabled: true, name: "Old", icon: "data:a" },
    { id: "b", version: "1", icon: "obsolete" },
    { id: "removed", version: "1", icon: "removed" }
  ])
  assert.deepEqual(
    result.map((item) => item.id),
    ["a", "b", "new"]
  )
  assert.equal(result[0].enabled, false)
  assert.equal(result[0].name, "Current")
  assert.equal(result[0].icon, "data:a")
  assert.equal(result[1], current[1])
  assert.equal(result[2], current[2])
})

test("popup icons use matching-version presentation data without replacing item metadata", () => {
  const cached = new Map([
    ["a", { id: "a", version: "1", icon: "data:a", name: "Old", enabled: true }],
    ["b", { id: "b", version: "old", icon: "obsolete" }]
  ])
  let renderedItem
  const { default: ExtensionIcon } = createSourceLoader({
    react: {
      memo: (component) => component,
      createContext: () => ({}),
      useContext: () => cached,
      createElement: (type, props) => ({ type, props })
    },
    ".../utils/extensionHelper": {
      getIcon: (item) => {
        renderedItem = item
        return item.icon ?? "manifest"
      }
    }
  })("src/pages/Popup/Components/common/ExtensionIcon.jsx")
  const item = { id: "a", version: "1", name: "Current", enabled: false }
  assert.equal(ExtensionIcon({ item, size: 128, alt: "" }).props.src, "data:a")
  assert.equal(renderedItem.name, "Current")
  assert.equal(renderedItem.enabled, false)
  assert.equal(item.icon, undefined)
  assert.equal(ExtensionIcon({ item: { id: "b", version: "2" } }).props.src, "manifest")
})
