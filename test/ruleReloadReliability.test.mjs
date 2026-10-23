import assert from "node:assert/strict"
import test from "node:test"
import { deferred, flush } from "./helpers/loadSource.mjs"
import { rule, ruleHarness } from "./helpers/ruleHarness.mjs"

const action = { actionType: "openWhenMatched", reloadAfterEnable: true }

test("multiple successful rules merge their reload and history failures do not block it", async () => {
  const h = ruleHarness()
  h.EM.History.EventHandler.onAutoEnabled = () => {
    throw Error("history unavailable")
  }
  h.handler.init(["S"], h.tab, [rule(action), rule(action, { extensions: ["B"] })], [], h.EM)
  await flush()
  assert.deepEqual(h.calls, [
    ["A", true],
    ["B", true],
    ["reload", 1]
  ])
})

test("slow disables finish before a single reload without blocking new evaluations", async () => {
  const h = ruleHarness()
  h.enabled.set("A", true)
  const disabled = deferred()
  h.chrome.management.setEnabled = async (id, value) => {
    await disabled.promise
    h.calls.push([id, value])
    h.enabled.set(id, value)
  }
  await h.init(rule({ actionType: "closeWhenMatched", reloadAfterDisable: true }))
  const completion = h.timers.shift()()
  for (const timer of h.timers.splice(0)) await timer()
  assert.deepEqual(h.calls, [])
  disabled.resolve()
  await completion
  await flush()
  assert.deepEqual(h.calls, [
    ["A", false],
    ["reload", 1]
  ])
})

test("navigation during an enable prevents reloading the replacement page", async () => {
  const h = ruleHarness()
  const enabled = deferred()
  h.chrome.management.setEnabled = async () => {
    await enabled.promise
    h.enabled.set("A", true)
  }
  await h.init(rule(action))
  h.tab.url = "https://elsewhere.example/"
  h.handler.onCurrentUrlChanged({ ...h.tab })
  enabled.resolve()
  await flush()
  assert.deepEqual(h.calls, [])
})

test("reload failures are contained and partial enable failures still allow a reload", async () => {
  const h = ruleHarness()
  const set = h.chrome.management.setEnabled
  h.chrome.management.setEnabled = async (id, value) => {
    if (id === "A") throw Error("policy denied")
    return set(id, value)
  }
  await h.init(rule(action, { extensions: ["A", "B"] }))
  assert.deepEqual(h.calls, [
    ["B", true],
    ["reload", 1]
  ])
  h.chrome.tabs.reload = async () => {
    throw Error("Tab closed")
  }
  h.enabled.clear()
  h.handler.onCurrentUrlChanged(h.tab)
  await flush()
})

test("reload intents survive worker replacement and dispatched entries are never retried", async () => {
  const h = ruleHarness()
  h.chrome.tabs.get = async () => ({ ...h.tab, pendingUrl: h.tab.url })
  await h.init(rule(action))
  assert.deepEqual(h.calls, [["A", true]])
  assert.ok(h.session["rulePendingReloads.v1"]?.length)
  const resumed = ruleHarness(h.session, h.enabled)
  await resumed.init(rule(action))
  assert.deepEqual(resumed.calls, [["reload", 1]])
  assert.deepEqual(resumed.records, [])
  const again = ruleHarness(h.session, h.enabled)
  await again.init(rule(action))
  assert.deepEqual(again.calls, [])
})

test("prepared journal entries recover actual success, but stale configuration and pages are discarded", async () => {
  const h = ruleHarness()
  h.chrome.tabs.get = async () => ({ ...h.tab, pendingUrl: h.tab.url })
  await h.init(rule(action))
  const snapshot = structuredClone(h.session)
  snapshot["rulePendingReloads.v1"][0].operations[0].applied = false
  const prepared = ruleHarness(structuredClone(snapshot), h.enabled)
  await prepared.init(rule(action))
  assert.deepEqual(prepared.calls, [["reload", 1]])
  const changedConfig = ruleHarness(structuredClone(snapshot), h.enabled)
  await changedConfig.init(rule({ ...action, reloadAfterEnable: false }))
  assert.deepEqual(changedConfig.calls, [])
  const changedPage = ruleHarness(structuredClone(snapshot), h.enabled)
  changedPage.tab.url = "https://elsewhere.example/"
  await changedPage.init(rule(action))
  assert.deepEqual(changedPage.calls, [])
})

test("session and asynchronous history failures never prevent successful operation and reload", async () => {
  const h = ruleHarness()
  h.chrome.storage.session.set = async () => {
    throw Error("quota")
  }
  h.EM.History.EventHandler.onAutoEnabled = async () => {
    throw Error("database")
  }
  await h.init(rule(action))
  assert.deepEqual(h.calls, [
    ["A", true],
    ["reload", 1]
  ])
})

test("failed and cancelled disables do not refresh; a successful peer still can", async () => {
  const h = ruleHarness()
  h.enabled.set("A", true)
  h.enabled.set("B", true)
  const set = h.chrome.management.setEnabled
  h.chrome.management.setEnabled = async (id, value) => {
    if (id === "B") throw Error("policy")
    return set(id, value)
  }
  await h.init(
    rule({ actionType: "closeWhenMatched", reloadAfterDisable: true }, { extensions: ["A", "B"] })
  )
  await h.runTimers()
  assert.deepEqual(h.calls, [
    ["A", false],
    ["reload", 1]
  ])
  const cancelled = ruleHarness()
  cancelled.enabled.set("A", true)
  await cancelled.init(rule({ actionType: "closeWhenMatched", reloadAfterDisable: true }))
  cancelled.handler.onCurrentScenesChanged([])
  await flush()
  await cancelled.runTimers()
  assert.deepEqual(cancelled.calls, [])
})

test("a disable already in flight reconciles the latest enable after it completes", async () => {
  const h = ruleHarness()
  h.enabled.set("A", true)
  const completion = deferred()
  const set = h.chrome.management.setEnabled
  h.chrome.management.setEnabled = async (id, value) => {
    if (!value) await completion.promise
    return set(id, value)
  }
  await h.init(rule({ actionType: "closeOnlyWhenMatched" }))
  const disabling = h.timers.shift()()
  await flush()
  h.handler.onCurrentScenesChanged([])
  await flush()
  completion.resolve()
  await disabling
  await flush()
  assert.deepEqual(h.calls, [
    ["A", false],
    ["A", true]
  ])
})

test("reconciliation also invalidates disables queued before the late completion", async () => {
  const h = ruleHarness()
  h.enabled.set("A", true)
  const completion = deferred()
  const set = h.chrome.management.setEnabled
  h.chrome.management.setEnabled = async (id, value) => {
    await completion.promise
    return set(id, value)
  }
  await h.init(rule({ actionType: "closeWhenMatched" }))
  const disabling = h.timers.shift()()
  await flush()
  h.handler.onCurrentUrlChanged(h.tab)
  await flush()
  completion.resolve()
  await disabling
  await flush()
  await h.runTimers()
  assert.deepEqual(h.calls, [["A", false]])
})

test("focus changes invalidate reloads immediately and wait for an authoritative current tab", async () => {
  for (const change of ["activation", "window", "none"]) {
    const h = ruleHarness()
    h.enabled.set("A", true)
    const completion = deferred()
    const set = h.chrome.management.setEnabled
    h.chrome.management.setEnabled = async (id, value) => {
      if (!value) await completion.promise
      return set(id, value)
    }
    h.options.ruleConfig = [rule({ actionType: "closeOnlyWhenMatched", reloadAfterDisable: true })]
    await h.start()
    const disabling = h.timers.shift()()
    await flush()
    let respond
    h.chrome.tabs.query = (_query, callback) => {
      respond = callback
    }
    if (change === "activation") h.events.activated.fire({ tabId: 2, windowId: 1 })
    else h.events.focused.fire(change === "none" ? -1 : 2)
    completion.resolve()
    await disabling
    await flush()
    assert.deepEqual(h.calls, [["A", false]], change)
    h.handler.onCurrentScenesChanged([])
    await flush()
    assert.deepEqual(h.calls, [["A", false]], `${change}: snapshot is still unready`)
    if (change === "none") h.events.focused.fire(1)
    respond([{ ...h.tab }])
    await flush()
    assert.deepEqual(
      h.calls,
      [
        ["A", false],
        ["A", true]
      ],
      `${change}: resume latest state`
    )
  }
})
