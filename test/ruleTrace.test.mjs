import assert from "node:assert/strict"
import test from "node:test"
import { createSourceLoader, flush } from "./helpers/loadSource.mjs"
import { ruleHarness } from "./helpers/ruleHarness.mjs"

const targetUrl = "https://gemini.google.com/"
const config = () => ({
  id: "gemini",
  version: 2,
  enable: true,
  match: {
    relationship: "and",
    triggers: [
      { trigger: "urlTrigger", config: { matchMethod: "wildcard", matchUrl: [targetUrl] } }
    ]
  },
  target: { extensions: ["A"] },
  action: { actionType: "openWhenMatched", reloadAfterEnable: true }
})
const entries = (h, event) =>
  h.logs.filter(([label]) => label === `[Rule trace] ${event}`).map(([, data]) => data)

test("rule and browser-event traces use console.log without a logger switch", () => {
  const h = ruleHarness()
  const logs = []
  const gatedLogger = () => ({
    debug() {
      throw Error("rule traces must not use debug logging")
    }
  })
  const load = createSourceLoader(
    {
      ".../utils/logger": gatedLogger,
      "../../../utils/logger.js": gatedLogger
    },
    { chrome: h.chrome, console: { log: (...args) => logs.push(args) } }
  )
  load("src/pages/Background/rule/ruleTrace.ts").traceRule(undefined, "probe")
  const events = load("src/pages/Background/event/tabChangeEvent.js")
  events.onTabUrlChange(() => {}, h.tab)
  h.events.updated.fire(
    1,
    { url: "https://next.example/" },
    { ...h.tab, url: "https://next.example/" }
  )
  assert.equal(logs[0][0], "[Rule trace] probe")
  assert.ok(logs.some(([label]) => label === "[Rule trace] event.received"))
})

test("traces distinguish pending matching from committed matching and correlate actions and reloads", async () => {
  const h = ruleHarness()
  const committedUrl = h.tab.url
  h.tab.pendingUrl = targetUrl
  await h.init(config())
  const pending = entries(h, "evaluation.started")[0]
  assert.ok(pending?.evaluationId)
  assert.equal(pending.urlSource, "pendingUrl")
  assert.equal(pending.committedUrl, committedUrl)
  assert.equal(pending.pendingUrl, targetUrl)
  assert.equal(pending.matchUrl, targetUrl)
  assert.equal(entries(h, "operation.enable.completed")[0].evaluationId, pending.evaluationId)
  assert.equal(entries(h, "reload.dispatched").length, 0)
  assert.equal(h.queryCount, 0)
  delete h.tab.pendingUrl
  h.tab.url = targetUrl
  h.handler.onCurrentUrlChanged({ ...h.tab })
  await flush()
  const committed = entries(h, "evaluation.started").at(-1)
  assert.notEqual(committed.evaluationId, pending.evaluationId)
  assert.equal(committed.urlSource, "url")
  assert.equal(committed.committedUrl, targetUrl)
  assert.equal(committed.pendingUrl, null)
  assert.equal(entries(h, "reload.dispatched")[0].evaluationId, committed.evaluationId)
  assert.equal(pending.committedUrl, committedUrl, "earlier log remains a stable snapshot")
})

test("a background pending match is identified separately from the current committed URL", async () => {
  const h = ruleHarness()
  const r = config()
  r.action = {
    actionType: "custom",
    custom: { timeWhenEnable: "match", urlMatchWhenEnable: "anyMatch" }
  }
  h.chrome.tabs.query = async () => [
    h.tab,
    { id: 2, windowId: 1, url: "about:blank", pendingUrl: targetUrl }
  ]
  await h.init(r)
  const result = entries(h, "rule.match.completed")[0]
  assert.equal(result.urlSource, "url")
  assert.equal(result.phase, "pending")
  assert.equal(result.matchedTab.tabId, 2)
  assert.equal(result.matchedTab.urlSource, "pendingUrl")
  assert.equal(result.matchedTab.committedUrl, "about:blank")
  assert.equal(result.matchedTab.matchUrl, targetUrl)
})
