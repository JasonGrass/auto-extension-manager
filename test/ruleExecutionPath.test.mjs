import assert from "node:assert/strict"
import test from "node:test"
import { deferred, flush } from "./helpers/loadSource.mjs"
import { rule, ruleHarness } from "./helpers/ruleHarness.mjs"

const url = {
  trigger: "urlTrigger",
  config: { matchMethod: "wildcard", matchUrl: ["example.com"] }
}

test("empty, inactive, no-action and empty-target rules never query tabs", async () => {
  for (const config of [
    null,
    { ...rule(), enable: false },
    rule({ actionType: "none" }),
    rule(undefined, { extensions: ["self"] })
  ]) {
    const h = ruleHarness()
    await h.init(config)
    assert.equal(h.queryCount, 0)
    assert.deepEqual(h.calls, [])
  }
})

test("current URL enables do not wait for an all-tabs query", async () => {
  const h = ruleHarness()
  const tabs = deferred()
  h.chrome.tabs.query = () => {
    h.queryCount++
    return tabs.promise
  }
  const config = rule()
  config.match.triggers = [url]
  await h.init(config)
  assert.deepEqual(h.calls, [["A", true]])
  assert.equal(h.queryCount, 0)
  tabs.resolve([h.tab])
})

test("other-tab matching and disable protection share one query", async () => {
  const h = ruleHarness()
  const config = rule({
    actionType: "custom",
    custom: { timeWhenEnable: "match", urlMatchWhenEnable: "anyMatch", timeWhenDisable: "none" }
  })
  config.match.triggers = [url]
  h.tab.url = "https://elsewhere.example/"
  h.enabled.set("B", true)
  h.chrome.tabs.query = async () => {
    h.queryCount++
    return [h.tab, { id: 2, url: "https://example.com/" }]
  }
  h.handler.init(
    ["S"],
    h.tab,
    [config, rule({ actionType: "closeWhenMatched" }, { extensions: ["B"] })],
    [],
    h.EM
  )
  await flush()
  await h.runTimers()
  assert.equal(h.queryCount, 1)
  assert.deepEqual(h.calls, [
    ["A", true],
    ["B", false]
  ])
})

test("platform info is shared across OS rules and failed lookups can retry", async () => {
  const h = ruleHarness()
  let calls = 0
  h.chrome.runtime.getPlatformInfo = async () => {
    calls++
    if (calls === 1) throw Error("temporary")
    return { os: "win" }
  }
  const os = rule()
  os.match.triggers = [{ trigger: "osTrigger", config: { os: ["win"] } }]
  await h.init(os)
  assert.deepEqual(h.calls, [])
  h.handler.onCurrentUrlChanged(h.tab)
  await flush()
  h.handler.onCurrentUrlChanged(h.tab)
  await flush()
  assert.equal(calls, 2)
  assert.deepEqual(h.calls, [["A", true]])
})
