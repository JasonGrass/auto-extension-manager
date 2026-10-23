import assert from "node:assert/strict"
import test from "node:test"

import { createLatestTaskRunner } from "../src/pages/Background/rule/latestTaskRunner.ts"

let importId = 0

function createChromeMock() {
  const createEvent = () => {
    let listener
    return {
      addListener(callback) {
        listener = callback
      },
      fire(...args) {
        listener(...args)
      }
    }
  }

  const events = {
    updated: createEvent(),
    activated: createEvent(),
    removed: createEvent(),
    created: createEvent(),
    windowFocused: createEvent(),
    windowRemoved: createEvent()
  }
  let queryCount = 0
  let getCount = 0
  let queryTabs = []

  globalThis.chrome = {
    tabs: {
      onUpdated: events.updated,
      onActivated: events.activated,
      onRemoved: events.removed,
      onCreated: events.created,
      query(_query, callback) {
        queryCount += 1
        callback(queryTabs)
      },
      async get() {
        getCount += 1
      }
    },
    windows: {
      WINDOW_ID_NONE: -1,
      onFocusChanged: events.windowFocused,
      onRemoved: events.windowRemoved
    }
  }

  return {
    events,
    setQueryTabs(tabs) {
      queryTabs = tabs
    },
    get queryCount() {
      return queryCount
    },
    get getCount() {
      return getCount
    }
  }
}

async function loadTabChangeEvent() {
  importId += 1
  return import(`../src/pages/Background/event/tabChangeEvent.js?test=${importId}`)
}

test("a URL update received before initialization is replayed after subscription", async () => {
  const chromeMock = createChromeMock()
  const eventModule = await loadTabChangeEvent()
  const calls = []

  chromeMock.events.updated.fire(
    1,
    { url: "https://gemini.google.com/" },
    { id: 1, windowId: 1, url: "https://gemini.google.com/", active: true }
  )
  eventModule.onTabUrlChange((tab) => calls.push(tab))

  assert.deepEqual(calls, [undefined])
  assert.equal(chromeMock.queryCount, 0)
})

test("only URL updates trigger rule evaluation", async () => {
  const chromeMock = createChromeMock()
  const eventModule = await loadTabChangeEvent()
  let callCount = 0
  eventModule.onTabUrlChange(() => {
    callCount += 1
  })

  const tab = { id: 1, windowId: 1, url: "https://example.com/", active: true }
  chromeMock.events.updated.fire(1, { status: "loading" }, tab)
  chromeMock.events.updated.fire(1, { title: "Example" }, tab)
  chromeMock.events.updated.fire(1, { favIconUrl: "favicon.ico" }, tab)

  assert.equal(callCount, 0)
  assert.equal(chromeMock.queryCount, 0)
})

test("current and background URL changes have distinct callback payloads", async () => {
  const chromeMock = createChromeMock()
  const eventModule = await loadTabChangeEvent()
  const calls = []
  eventModule.onTabUrlChange((tab) => calls.push(tab), {
    id: 1,
    windowId: 1,
    url: "https://before.example/"
  })

  chromeMock.events.updated.fire(
    1,
    { url: "https://after.example/" },
    { id: 1, windowId: 1, url: "https://after.example/", title: "After", active: true }
  )
  chromeMock.events.updated.fire(
    2,
    { url: "https://background.example/" },
    { id: 2, windowId: 1, url: "https://background.example/", active: false }
  )

  assert.deepEqual(calls, [
    {
      id: 1,
      windowId: 1,
      url: "https://after.example/",
      title: "After"
    },
    undefined
  ])
  assert.equal(chromeMock.queryCount, 0)
})

test("an active tab in a previously focused window never replaces the current tab", async () => {
  const chromeMock = createChromeMock()
  const eventModule = await loadTabChangeEvent()
  const calls = []
  const currentInA = {
    id: 1,
    windowId: 1,
    url: "https://window-a.example/",
    active: true
  }
  const currentInB = {
    id: 2,
    windowId: 2,
    url: "https://window-b.example/",
    active: true
  }
  eventModule.onTabUrlChange((tab) => calls.push(tab), currentInA)

  chromeMock.setQueryTabs([currentInB])
  chromeMock.events.windowFocused.fire(2)
  chromeMock.events.updated.fire(
    1,
    { url: "https://window-a.example/updated" },
    { ...currentInA, url: "https://window-a.example/updated" }
  )

  assert.equal(calls[0].id, currentInB.id)
  assert.equal(calls[1], undefined)
  assert.equal(
    calls.some((tab) => tab?.url?.endsWith("/updated")),
    false
  )
  assert.equal(chromeMock.queryCount, 2)
})

test("new tabs never poll while waiting for a URL or title", async () => {
  const chromeMock = createChromeMock()
  const eventModule = await loadTabChangeEvent()
  let callCount = 0
  eventModule.onTabUrlChange(() => {
    callCount += 1
  })

  chromeMock.events.created.fire({ id: 2, windowId: 1, active: false })
  chromeMock.events.created.fire({
    id: 3,
    windowId: 1,
    active: false,
    url: "https://background.example/"
  })

  assert.equal(callCount, 1)
  assert.equal(chromeMock.getCount, 0)
})

test("a newer navigation wins over an earlier initialization snapshot", async () => {
  const chromeMock = createChromeMock()
  const eventModule = await loadTabChangeEvent()
  const callback = () => {}
  eventModule.onTabUrlChange(callback, {
    id: 1,
    windowId: 1,
    url: "https://before.example/"
  })
  chromeMock.events.updated.fire(
    1,
    { url: "https://after.example/" },
    { id: 1, windowId: 1, url: "https://after.example/", title: "After", active: true }
  )

  const currentTab = eventModule.onTabUrlChange(callback, {
    id: 1,
    windowId: 1,
    url: "https://before.example/"
  })

  assert.equal(currentTab.url, "https://after.example/")
})

test("latest task runner coalesces calls and never overlaps executions", async () => {
  let callCount = 0
  let activeCount = 0
  let maxActiveCount = 0
  let releaseFirst
  const firstRun = new Promise((resolve) => {
    releaseFirst = resolve
  })
  const runLatest = createLatestTaskRunner(async () => {
    callCount += 1
    activeCount += 1
    maxActiveCount = Math.max(maxActiveCount, activeCount)
    if (callCount === 1) {
      await firstRun
    }
    activeCount -= 1
  })

  runLatest()
  runLatest()
  await new Promise((resolve) => queueMicrotask(resolve))
  assert.equal(callCount, 1)

  runLatest()
  runLatest()
  releaseFirst()
  await new Promise((resolve) => setImmediate(resolve))

  assert.equal(callCount, 2)
  assert.equal(maxActiveCount, 1)
})

test("pendingUrl from a loading snapshot is delivered once and confirmation retains navigation identity", async () => {
  const mock = createChromeMock()
  const events = await loadTabChangeEvent()
  const calls = []
  const tab = { id: 1, windowId: 1, active: true, url: "https://old.example/" }
  events.onTabUrlChange((current, change) => calls.push({ current, change }), tab)
  const loading = { ...tab, pendingUrl: "https://gemini.google.com/", status: "loading" }
  mock.events.updated.fire(1, { status: "loading" }, loading)
  mock.events.updated.fire(1, { title: "Loading" }, loading)
  assert.equal(calls.length, 1)
  assert.equal(calls[0].change.phase, "pending")
  assert.equal(calls[0].current.pendingUrl, loading.pendingUrl)
  mock.events.updated.fire(
    1,
    { url: loading.pendingUrl },
    { ...tab, url: loading.pendingUrl, status: "loading" }
  )
  assert.equal(calls.length, 2)
  assert.equal(calls[1].change.phase, "committed")
  assert.equal(calls[0].change.navigationId, calls[1].change.navigationId)
})

test("background pending snapshots never replace the focused tab and cancellation is reported", async () => {
  const mock = createChromeMock()
  const events = await loadTabChangeEvent()
  const calls = []
  const current = { id: 1, windowId: 1, url: "https://current.example/" }
  events.onTabUrlChange((tab, change) => calls.push({ tab, change }), current)
  const background = {
    id: 2,
    windowId: 1,
    active: false,
    url: "about:blank",
    pendingUrl: "https://gemini.google.com/",
    status: "loading"
  }
  mock.events.updated.fire(2, { status: "loading" }, background)
  assert.equal(calls.length, 1)
  assert.equal(calls[0].tab, undefined)
  assert.equal(calls[0].change.tab.id, 2)
  mock.events.updated.fire(
    2,
    { status: "complete" },
    { ...background, pendingUrl: undefined, status: "complete" }
  )
  assert.equal(calls[1].change.cancelled, true)
})

test("pendingUrl disappearing after the URL was committed is not a cancellation", async () => {
  const mock = createChromeMock()
  const events = await loadTabChangeEvent()
  const calls = []
  const original = { id: 1, windowId: 1, active: true, url: "https://old.example/" }
  events.onTabUrlChange((_current, change) => calls.push(change), original)
  const pending = { ...original, pendingUrl: "https://gemini.google.com/", status: "loading" }
  mock.events.updated.fire(1, { status: "loading" }, pending)
  mock.events.updated.fire(1, { url: pending.pendingUrl }, { ...pending, url: pending.pendingUrl })
  mock.events.updated.fire(
    1,
    { status: "complete" },
    { ...pending, url: pending.pendingUrl, pendingUrl: undefined, status: "complete" }
  )
  assert.equal(calls.at(-1).cancelled, false)
  assert.equal(calls[0].navigationId, calls.at(-1).navigationId)
})

test("a late focus query cannot overwrite a newer navigation snapshot", async () => {
  const mock = createChromeMock()
  const events = await loadTabChangeEvent()
  const calls = []
  const original = { id: 1, windowId: 1, active: true, url: "https://old.example/" }
  events.onTabUrlChange((tab) => calls.push(tab), original)
  const responses = []
  chrome.tabs.query = (_query, callback) => {
    responses.push(callback)
  }
  mock.events.activated.fire({ tabId: 1, windowId: 1 })
  const pending = { ...original, pendingUrl: "https://gemini.google.com/", status: "loading" }
  mock.events.updated.fire(1, { status: "loading" }, pending)
  responses[1]([pending])
  responses[0]([original])
  assert.equal(events.onTabUrlChange(() => {}).pendingUrl, pending.pendingUrl)
})

test("out-of-order focus queries preserve background navigation event order", async () => {
  const mock = createChromeMock()
  const events = await loadTabChangeEvent()
  const calls = []
  const current = { id: 1, windowId: 1, active: true, url: "https://current.example/" }
  events.onTabUrlChange((tab, change) => calls.push({ tab, change }), current)
  const responses = []
  chrome.tabs.query = (_query, callback) => responses.push(callback)
  const background = {
    id: 2,
    windowId: 2,
    active: true,
    url: "about:blank",
    pendingUrl: "https://background.example/",
    status: "loading"
  }
  mock.events.updated.fire(2, { status: "loading" }, background)
  mock.events.updated.fire(
    2,
    { url: background.pendingUrl },
    { ...background, url: background.pendingUrl, pendingUrl: undefined, status: "complete" }
  )
  responses[1]([current])
  responses[0]([current])

  assert.deepEqual(
    calls.map(({ tab, change }) => [tab?.id, change.tab.id, change.phase]),
    [
      [undefined, 2, "pending"],
      [undefined, 2, "committed"]
    ]
  )
  assert.equal(calls[0].change.navigationId, calls[1].change.navigationId)
  assert.equal(events.onTabUrlChange(() => {}).id, 1)
})

test("a late focus query cannot replay navigation after the changed tab closes", async () => {
  const mock = createChromeMock()
  const events = await loadTabChangeEvent()
  const calls = []
  const current = { id: 1, windowId: 1, active: true, url: "https://current.example/" }
  events.onTabUrlChange((tab, change) => calls.push({ tab, change }), current)
  let respond
  chrome.tabs.query = (_query, callback) => {
    respond = callback
  }
  mock.events.updated.fire(
    2,
    { status: "loading" },
    {
      id: 2,
      windowId: 2,
      active: true,
      url: "about:blank",
      pendingUrl: "https://background.example/",
      status: "loading"
    }
  )
  mock.events.removed.fire(2, { windowId: 2 })
  calls.length = 0
  respond([current])

  assert.deepEqual(calls, [])
  assert.equal(events.getTabNavigation(2), undefined)
})

test("losing window focus discards an earlier focus query", async () => {
  const mock = createChromeMock()
  const events = await loadTabChangeEvent()
  const calls = []
  const original = { id: 1, windowId: 1, active: true, url: "https://old.example/" }
  events.onTabUrlChange((tab) => calls.push(tab), original)
  let respond
  chrome.tabs.query = (_query, callback) => {
    respond = callback
  }
  mock.events.activated.fire({ tabId: 1, windowId: 1 })
  mock.events.windowFocused.fire(-1)
  respond([{ ...original, id: 2 }])
  assert.deepEqual(calls, [])
})

test("navigation in an unfocused browser cannot resume its current-tab snapshot", async () => {
  const mock = createChromeMock()
  const events = await loadTabChangeEvent()
  const tab = { id: 1, windowId: 1, active: true, url: "https://old.example/" }
  events.onTabUrlChange(() => {}, tab)
  mock.events.windowFocused.fire(-1)
  mock.events.activated.fire({ tabId: 1, windowId: 1 })
  mock.events.updated.fire(
    1,
    { url: "https://new.example/" },
    { ...tab, url: "https://new.example/" }
  )
  assert.equal(mock.queryCount, 0)
  assert.equal(
    events.onTabUrlChange(() => {}, tab),
    undefined
  )
})
