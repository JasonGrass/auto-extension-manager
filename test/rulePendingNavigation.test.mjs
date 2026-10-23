import assert from "node:assert/strict"
import test from "node:test"
import { flush } from "./helpers/loadSource.mjs"
import { rule, ruleHarness } from "./helpers/ruleHarness.mjs"

const gemini = "https://gemini.google.com/"
function config(reload = true) {
  const r = rule({ actionType: "openOnlyWhenMatched", reloadAfterEnable: reload })
  r.match.triggers = [
    { trigger: "urlTrigger", config: { matchMethod: "wildcard", matchUrl: [gemini] } }
  ]
  return r
}
function navigate(h, tab, id = "navigation-1", cancelled = false) {
  h.handler.onCurrentUrlChanged(tab.id === h.tab.id ? { ...tab } : undefined, {
    tab: { ...tab },
    navigationId: id,
    phase: tab.pendingUrl ? "pending" : "committed",
    cancelled
  })
}

test("pending navigation pre-enables once, then retains its reload after commit", async () => {
  const h = ruleHarness()
  await h.init(config())
  Object.assign(h.tab, { pendingUrl: gemini, status: "loading" })
  navigate(h, h.tab)
  await flush()
  assert.deepEqual(h.calls, [["A", true]])
  navigate(h, h.tab)
  await flush()
  assert.deepEqual(h.calls, [["A", true]])
  delete h.tab.pendingUrl
  h.tab.url = gemini
  navigate(h, h.tab)
  await flush()
  assert.deepEqual(h.calls, [
    ["A", true],
    ["reload", 1]
  ])
  assert.deepEqual(h.records, [["enable", "A"]])
})

test("pending navigation never disables or refreshes the old page", async () => {
  const h = ruleHarness()
  h.tab.url = gemini
  h.enabled.set("A", true)
  await h.init(config())
  h.tab.pendingUrl = "https://elsewhere.example/"
  navigate(h, h.tab)
  await flush()
  await h.runTimers()
  assert.deepEqual(h.calls, [])
  delete h.tab.pendingUrl
  h.tab.url = "https://elsewhere.example/"
  navigate(h, h.tab)
  await flush()
  await h.runTimers()
  assert.deepEqual(h.calls, [["A", false]])
})

test("cancelled navigation drops its refresh and reevaluates the committed URL", async () => {
  const h = ruleHarness()
  await h.init(config())
  h.tab.pendingUrl = gemini
  navigate(h, h.tab)
  await flush()
  delete h.tab.pendingUrl
  navigate(h, h.tab, "navigation-1", true)
  await flush()
  await h.runTimers()
  assert.deepEqual(h.calls, [
    ["A", true],
    ["A", false]
  ])
})

test("redirects retain refresh only while the final rule still wins", async () => {
  for (const destination of [`${gemini}app`, "https://elsewhere.example/"]) {
    const h = ruleHarness()
    await h.init(config())
    h.tab.pendingUrl = gemini
    navigate(h, h.tab)
    await flush()
    h.tab.pendingUrl = destination
    navigate(h, h.tab)
    await flush()
    delete h.tab.pendingUrl
    h.tab.url = destination
    navigate(h, h.tab)
    await flush()
    await h.runTimers()
    assert.equal(
      h.calls.filter(([type]) => type === "reload").length,
      destination.startsWith(gemini) ? 1 : 0
    )
  }
})

test("background pending targets affect anyMatch but never currentMatch or the foreground URL", async () => {
  for (const mode of ["currentMatch", "anyMatch"]) {
    const h = ruleHarness()
    const r = config()
    r.action = {
      actionType: "custom",
      reloadAfterEnable: true,
      custom: {
        timeWhenEnable: "match",
        urlMatchWhenEnable: mode,
        timeWhenDisable: "none"
      }
    }
    const background = { id: 2, windowId: 1, active: false, url: "about:blank", pendingUrl: gemini }
    h.chrome.tabs.query = async () => [h.tab, background]
    await h.init(r)
    navigate(h, background)
    await flush()
    assert.deepEqual(h.calls, mode === "anyMatch" ? [["A", true]] : [])
    assert.equal(h.tab.url, "https://example.com/")
  }
})

test("cold-start pending navigation and worker recovery retain their event navigation identity", async () => {
  const h = ruleHarness()
  h.options.ruleConfig = [config()]
  h.tab.pendingUrl = gemini
  h.tab.status = "loading"
  await h.start()
  assert.deepEqual(h.calls, [["A", true]])
  const resumed = ruleHarness(h.session, h.enabled)
  resumed.options.ruleConfig = [config()]
  resumed.tab.pendingUrl = gemini
  resumed.tab.status = "loading"
  await resumed.start()
  assert.deepEqual(resumed.calls, [])
  resumed.tab.url = gemini
  delete resumed.tab.pendingUrl
  resumed.events.updated.fire(1, { url: gemini }, { ...resumed.tab })
  await flush()
  assert.deepEqual(resumed.calls, [["reload", 1]])
  assert.deepEqual(resumed.records, [])
})

test("pending rules resolve disabling conflicts before filtering actions", async () => {
  const h = ruleHarness()
  const close = config()
  close.action = { actionType: "closeWhenMatched" }
  h.handler.init([], h.tab, [close, config()], [], h.EM)
  await flush()
  h.tab.pendingUrl = gemini
  navigate(h, h.tab)
  await flush()
  await h.runTimers()
  assert.deepEqual(h.calls, [])
})

test("closing or replacing a pending tab prevents its recovered refresh", async () => {
  const h = ruleHarness()
  await h.init(config())
  h.tab.pendingUrl = gemini
  navigate(h, h.tab)
  await flush()
  h.handler.onTabClosed(1, {})
  await flush()
  const resumed = ruleHarness(h.session, h.enabled)
  resumed.tab.url = gemini
  await resumed.init(config())
  assert.deepEqual(resumed.calls, [])
})

test("unrelated background and scene events cannot discard a foreground pending reload", async () => {
  for (const event of ["background", "scene"]) {
    const h = ruleHarness()
    await h.init(config())
    h.tab.pendingUrl = gemini
    navigate(h, h.tab)
    await flush()
    if (event === "background")
      navigate(
        h,
        { id: 2, windowId: 1, active: false, url: "https://background.example/" },
        "background"
      )
    else h.handler.onCurrentScenesChanged(["S"])
    await flush()
    delete h.tab.pendingUrl
    h.tab.url = gemini
    navigate(h, h.tab)
    await flush()
    assert.deepEqual(
      h.calls,
      [
        ["A", true],
        ["reload", 1]
      ],
      event
    )
  }
})

test("cold-start anyMatch discovers background pending targets before commit", async () => {
  const h = ruleHarness()
  const r = config(false)
  r.action = {
    actionType: "custom",
    custom: {
      timeWhenEnable: "match",
      urlMatchWhenEnable: "anyMatch",
      timeWhenDisable: "none"
    }
  }
  const background = { id: 2, windowId: 1, active: false, url: "about:blank", pendingUrl: gemini }
  h.chrome.tabs.query = async () => [h.tab, background]
  await h.init(r)
  assert.deepEqual(h.calls, [["A", true]])
})

test("pending navigation discovered by disable protection also prevents the disable", async () => {
  const h = ruleHarness()
  h.enabled.set("A", true)
  h.chrome.tabs.query = async () => [h.tab, { id: 2, url: "about:blank", pendingUrl: gemini }]
  await h.init(rule({ actionType: "closeWhenMatched" }))
  await h.runTimers()
  assert.deepEqual(h.calls, [])
})

test("a startup active-tab result cannot resurrect a tab closed while querying", async () => {
  const h = ruleHarness()
  h.options.ruleConfig = [config()]
  h.tab.url = gemini
  const oldTab = { ...h.tab }
  let respond
  h.chrome.tabs.query = (query, callback) => {
    if (callback) {
      callback([])
      return Promise.resolve([])
    }
    if (!query.active) return Promise.resolve([])
    return new Promise((resolve) => {
      respond = resolve
    })
  }
  const starting = h.start()
  await flush()
  h.events.removed.fire(1, {})
  respond([oldTab])
  await starting
  assert.deepEqual(h.calls, [])
})

test("activation in an unfocused window preserves a foreground pending reload", async () => {
  const h = ruleHarness()
  h.options.ruleConfig = [config()]
  await h.start()
  h.tab.pendingUrl = gemini
  h.events.updated.fire(1, { status: "loading" }, { ...h.tab, status: "loading" })
  await flush()
  assert.deepEqual(h.calls, [["A", true]])
  h.events.activated.fire({ tabId: 3, windowId: 2 })
  await flush()
  delete h.tab.pendingUrl
  h.tab.url = gemini
  h.events.updated.fire(1, { url: gemini }, { ...h.tab })
  await flush()
  assert.deepEqual(h.calls, [
    ["A", true],
    ["reload", 1]
  ])
})

test("superseding a background commit focus query does not leave disables stuck pending", async (t) => {
  for (const order of ["older-first", "newer-first"]) {
    await t.test(order, async () => {
      const h = ruleHarness()
      h.enabled.set("A", true)
      h.options.ruleConfig = [config(false)]
      await h.start()
      const background = {
        id: 2,
        windowId: 2,
        active: true,
        url: "about:blank",
        pendingUrl: gemini,
        status: "loading"
      }
      const other = { id: 3, windowId: 3, active: true, url: "https://other.example/" }
      const responses = []
      h.chrome.tabs.query = (_query, callback) => {
        if (callback) {
          responses.push(callback)
          return
        }
        return Promise.resolve([h.tab, background, other])
      }
      h.events.updated.fire(2, { status: "loading" }, { ...background })
      responses.shift()([{ ...h.tab }])
      await flush()
      await h.runTimers()
      assert.deepEqual(h.calls, [])

      delete background.pendingUrl
      background.url = gemini
      background.status = "complete"
      h.events.updated.fire(2, { url: gemini }, { ...background })
      h.events.updated.fire(3, { url: other.url }, { ...other })
      if (order === "newer-first") responses.reverse()
      for (const respond of responses) respond([{ ...h.tab }])
      await flush()
      await h.runTimers()

      assert.deepEqual(h.calls, [["A", false]])
      assert.deepEqual(h.records, [["disable", "A"]])
      assert.deepEqual(h.errors, [])
    })
  }
})

test("new active tabs wait for their current-tab snapshot before evaluating URL rules", async (t) => {
  for (const event of ["created", "updated"]) {
    await t.test(event, async () => {
      const h = ruleHarness()
      h.tab.url = gemini
      const r = config(false)
      r.action = { actionType: "openWhenMatched" }
      h.options.ruleConfig = [r]
      await h.start()
      h.enabled.set("A", false)
      h.calls.length = 0

      const next = { id: 2, windowId: 1, active: true, url: "https://other.example/" }
      h.tab.active = false
      let respond
      h.chrome.tabs.query = (_query, callback) => {
        if (callback) {
          respond = callback
          return
        }
        return Promise.resolve([h.tab, next])
      }
      if (event === "created") h.events.created.fire({ ...next })
      else h.events.updated.fire(2, { url: next.url }, { ...next })
      await flush()
      assert.deepEqual(h.calls, [])

      respond([{ ...next }])
      await flush()
      assert.deepEqual(h.calls, [])

      next.url = gemini
      h.events.updated.fire(2, { url: gemini }, { ...next })
      await flush()
      assert.deepEqual(h.calls, [["A", true]])
    })
  }
})
