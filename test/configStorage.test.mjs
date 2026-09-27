import assert from "node:assert/strict"
import { test } from "node:test"
import { createSourceLoader, deferred, flush } from "./helpers/loadSource.mjs"

function harness() {
  const h = {
    data: {},
    cache: null,
    notifications: [],
    failWrite: false,
    response: { state: "success" }
  }
  const chrome = {
    i18n: { getMessage: (key) => key },
    runtime: {
      async sendMessage(message) {
        h.notifications.push(JSON.parse(message))
        return h.response
      }
    },
    storage: {
      sync: {
        QUOTA_BYTES: 102400,
        QUOTA_BYTES_PER_ITEM: 8192,
        get(keys, callback) {
          const data = structuredClone(h.data)
          const result = keys
            ? Object.fromEntries(Object.entries(data).filter(([key]) => keys.includes(key)))
            : data
          if (callback) callback(result)
          else return Promise.resolve(result)
        },
        set(items, callback) {
          if (h.failWrite) chrome.runtime.lastError = { message: "QUOTA_BYTES" }
          else Object.assign(h.data, structuredClone(items))
          callback?.()
          delete chrome.runtime.lastError
        },
        remove(keys, callback) {
          for (const key of keys) delete h.data[key]
          callback?.()
        },
        async clear() {
          h.data = {}
        }
      }
    }
  }
  const load = createSourceLoader(
    {
      "webext-polyfill-kinda": chrome,
      "webext-options-sync": class {},
      localforage: {
        LOCALSTORAGE: "local",
        createInstance: () => ({
          async setItem(_key, value) {
            if (h.failCache) throw new Error("cache quota")
            h.cache = structuredClone(value)
          }
        })
      },
      ".../utils/utils": { getLang: (key) => key }
    },
    { chrome, console: { log() {}, error() {} } }
  )
  h.api = load("src/storage/sync/options-storage.js").SyncOptionsStorage
  h.rules = load("src/storage/sync/RuleConfigOptions.js").RuleConfigOptions
  h.groups = load("src/storage/sync/GroupOptions.js").GroupOptions
  return h
}

test("all rule and group mutations notify once after storage and cache updates", async () => {
  const h = harness()
  const config = { id: "R", version: 2, enable: true }
  for (const change of [
    () => h.rules.addOne(config),
    () => h.rules.duplicate(config),
    () => h.rules.update({ ...config, enable: false }),
    () => h.rules.deleteOne("R"),
    () => h.groups.addGroup({ id: "G", name: "G", extensions: ["A"] }),
    () => h.groups.update({ id: "G", name: "G", extensions: ["B"] }),
    () => h.groups.deleteGroup("G")
  ]) {
    h.notifications.length = 0
    await change()
    assert.deepEqual(h.notifications, [{ id: "rule-config-changed" }])
    assert.deepEqual(h.cache, await h.api.getAll())
  }
})

test("unrelated settings and annotations do not trigger automatic rule execution", async () => {
  const h = harness()
  await h.api.set({ setting: { darkMode: "dark" } })
  await h.api.set({ management: { extensions: [] } })
  assert.deepEqual(h.notifications, [])
})

test("import and reset update the cache and wait for worker acknowledgement", async () => {
  const h = harness()
  const ack = deferred()
  h.response = ack.promise
  let finished = false
  const saved = h.api
    .setAll({ ruleConfig: [{ id: "R" }], groups: [], scenes: [], management: {} })
    .then(() => {
      finished = true
    })
  await flush()
  assert.equal(h.notifications.length, 1)
  assert.equal(finished, false)
  assert.deepEqual(h.cache.ruleConfig, [{ id: "R" }])
  ack.resolve({ state: "success" })
  await saved
  h.response = { state: "success" }
  await h.api.clearAll()
  assert.deepEqual(h.cache.ruleConfig, [])
  assert.deepEqual(h.cache.groups, [])
  assert.equal(h.notifications.length, 2)
})

test("write failures reject without claiming that the worker was refreshed", async () => {
  const h = harness()
  h.failWrite = true
  await assert.rejects(h.api.set({ ruleConfig: [] }), /QUOTA_BYTES/)
  assert.equal(h.cache, null)
  assert.deepEqual(h.notifications, [])
})

test("a persisted configuration reports background refresh failure distinctly", async () => {
  const h = harness()
  h.response = { state: "error", message: "worker read failed" }
  await assert.rejects(h.api.set({ ruleConfig: [{ id: "R" }] }), { code: "CONFIG_REFRESH_FAILED" })
  assert.deepEqual((await h.api.getAll()).ruleConfig, [{ id: "R" }])
})

test("cache failures never prevent refreshing a committed save, import or reset", async () => {
  const h = harness()
  h.failCache = true
  for (const change of [
    () => h.api.set({ ruleConfig: [] }),
    () => h.api.setAll({ ruleConfig: [], groups: [], management: {}, scenes: [] }),
    () => h.api.clearAll()
  ]) {
    h.notifications.length = 0
    await assert.rejects(change(), { code: "CONFIG_CACHE_FAILED" })
    assert.deepEqual(h.notifications, [{ id: "rule-config-changed" }])
  }
})

test("overlapping short and chunked writes never delete chunks of the newer value", () => {
  const operations = [],
    data = {}
  const chrome = {
    runtime: {},
    storage: {
      sync: {
        QUOTA_BYTES: 102400,
        QUOTA_BYTES_PER_ITEM: 200,
        set(items, callback) {
          operations.push(() => {
            Object.assign(data, items)
            callback?.()
          })
        },
        remove(keys, callback) {
          operations.push(() => {
            for (const key of keys) delete data[key]
            callback?.()
          })
        },
        get(_keys, callback) {
          callback(structuredClone(data))
        }
      }
    }
  }
  const api = createSourceLoader({}, { chrome })("src/storage/utils/LargeSyncStorage.js").default
  const large = Array.from({ length: 500 }, (_, i) => `extension-${i}-${i * 7919}`)
  api.set({ ruleConfig: ["small"] }, () => {})
  api.set({ ruleConfig: large }, () => {})
  while (operations.length) operations.shift()()
  let actual, error
  api.get(["ruleConfig"], (value, failure) => {
    actual = value
    error = failure
  })
  assert.equal(error, undefined)
  assert.deepEqual(actual.ruleConfig, large)
})
