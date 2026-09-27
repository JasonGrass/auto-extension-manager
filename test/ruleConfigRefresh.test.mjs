import assert from "node:assert/strict"
import { test } from "node:test"
import { deferred, flush } from "./helpers/loadSource.mjs"
import { rule, ruleHarness } from "./helpers/ruleHarness.mjs"

test("removing the final rule stops subsequent automatic actions", async () => {
  const h = ruleHarness()
  await h.init()
  assert.deepEqual(h.calls, [["A", true]])
  h.calls.length = 0
  h.enabled.clear()
  h.handler.setRules([])
  h.handler.onCurrentUrlChanged(h.tab)
  await flush()
  assert.deepEqual(h.calls, [])
})

test("deleting rules cancels delayed disables and their page reloads", async () => {
  const h = ruleHarness()
  h.enabled.set("A", true)
  await h.init(rule({ actionType: "closeWhenMatched", reloadAfterDisable: true }))
  h.handler.setRules([])
  await h.runTimers()
  assert.deepEqual(h.calls, [])
  assert.deepEqual(h.records, [])
})

test("refresh replaces group targets, including empty and deleted groups", async () => {
  const h = ruleHarness()
  await h.init(rule(undefined, { groups: ["G"] }), [{ id: "G", extensions: ["A"] }])
  h.calls.length = 0
  h.options.groups = [{ id: "G", extensions: ["B"] }]
  await h.handler.refreshConfig()
  await flush()
  assert.deepEqual(h.calls, [["B", true]])
  for (const groups of [[{ id: "G", extensions: [] }], []]) {
    h.calls.length = 0
    h.enabled.clear()
    h.options.groups = groups
    await h.handler.refreshConfig()
    await flush()
    assert.deepEqual(h.calls, [])
  }
})

test("refresh loads imported rules and clears all runtime state on reset", async () => {
  const h = ruleHarness()
  await h.init()
  h.calls.length = 0
  h.options.ruleConfig = [rule(undefined, { groups: ["new"] })]
  h.options.groups = [{ id: "new", extensions: ["B"] }]
  await h.handler.refreshConfig()
  await flush()
  assert.deepEqual(h.calls, [["B", true]])
  h.options = { ruleConfig: [], groups: [], scenes: [] }
  await h.handler.refreshConfig()
  h.enabled.clear()
  h.calls.length = 0
  h.handler.onCurrentUrlChanged(h.tab)
  await flush()
  assert.deepEqual(h.calls, [])
  assert.deepEqual(h.activeIds, [])
})

test("an older configuration read cannot replace a newer configuration", async () => {
  const h = ruleHarness()
  await h.init(null)
  const first = deferred(),
    second = deferred()
  const reads = [first, second]
  h.storage.options.getAll = () => reads.shift().promise
  const oldRefresh = h.handler.refreshConfig()
  const newRefresh = h.handler.refreshConfig()
  second.resolve({
    ruleConfig: [rule(undefined, { extensions: ["B"] })],
    groups: [],
    scenes: [{ id: "S" }]
  })
  await newRefresh
  await flush()
  first.resolve({ ruleConfig: [rule()], groups: [], scenes: [{ id: "S" }] })
  await oldRefresh
  await flush()
  assert.deepEqual(h.calls, [["B", true]])
})

test("a refresh invalidates an evaluation waiting for extension metadata", async () => {
  const h = ruleHarness()
  const metadata = deferred()
  h.chrome.management.get = () => metadata.promise
  await h.init()
  h.options.ruleConfig = []
  await h.handler.refreshConfig()
  metadata.resolve({ id: "A", name: "A", enabled: false })
  await flush()
  assert.deepEqual(h.calls, [])
})

test("failed refreshes reject and do not resume actions from stale configuration", async () => {
  const h = ruleHarness()
  await h.init()
  h.storage.options.getAll = async () => {
    throw new Error("read failed")
  }
  await assert.rejects(h.handler.refreshConfig(), /read failed/)
  h.calls.length = 0
  h.enabled.clear()
  h.handler.onCurrentUrlChanged(h.tab)
  await flush()
  assert.deepEqual(h.calls, [])
})

test("re-enabling after disable completion still cancels its pending page reload", async () => {
  const h = ruleHarness()
  h.enabled.set("A", true)
  await h.init(rule({ actionType: "closeOnlyWhenMatched", reloadAfterDisable: true }))
  await h.timers.shift()()
  h.handler.onCurrentScenesChanged([])
  await flush()
  await h.runTimers()
  assert.deepEqual(h.calls, [
    ["A", false],
    ["A", true]
  ])
})
