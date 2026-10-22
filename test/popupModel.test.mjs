import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"
import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import ts from "typescript"

import { createSourceLoader, deferred, flush } from "./helpers/loadSource.mjs"

const extension = (id, enabled = true) => ({ id, name: id, type: "extension", enabled })
const options = (setting = {}) => ({ setting, groups: [], extensions: [], ruleConfig: [] })
const topRule = (extensions = [], groups = []) => ({
  enable: true,
  action: { showOnTheTop: true },
  target: { extensions, groups }
})

function modelHarness({ react = React, query, recently, order, keys, record } = {}) {
  const calls = { tabs: 0, order: 0, recent: 0, keys: 0, records: [] }
  const load = createSourceLoader({
    react,
    "webext-polyfill-kinda": {
      tabs: {
        query: async () => {
          calls.tabs++
          return query ? query() : [{ url: "https://example.com" }]
        }
      }
    },
    ".../pages/Background/extension/ExtensionRepo": {
      ExtensionRepo: class {
        async getKeys() {
          calls.keys++
          return keys ? keys() : []
        }
        async get(id) {
          calls.records.push(id)
          return record ? record(id) : null
        }
      }
    },
    ".../pages/Background/rule/handlers/matchHandler": { isMatchByCurrent: async () => true },
    ".../storage/local": {
      LocalOptions: class {
        async getActiveSceneIds() {
          return []
        }
      }
    },
    ".../storage/local/ManualEnableCounter": {
      ManualEnableCounter: class {
        async getOrder() {
          calls.order++
          return order ? order() : []
        }
        async getRecentlyEnableIds() {
          calls.recent++
          return recently ? recently() : []
        }
      }
    },
    ".../utils/channelHelper": {},
    "../assets/img/puzzle.svg": "puzzle.svg",
    "./utils": {},
    ".../utils/utils": { getLang: (key) => key }
  })
  return { load, calls }
}

// Capture only this hook's state writes and effect lifetime; browser/storage boundaries stay fake.
function effectHarness(config) {
  const commits = []
  let cleanup
  const react = {
    useState: (initial) => [initial, (value) => commits.push(value)],
    useMemo: (compute) => compute(),
    useEffect: (effect) => {
      cleanup?.()
      cleanup = effect()
    }
  }
  return { ...modelHarness({ ...config, react }), commits, dispose: () => cleanup?.() }
}

test("search exposes the selected initial group and apps on the first render", () => {
  const { load } = modelHarness()
  const { useSearchController } = load("src/pages/Popup/hooks/useSearchController.js")
  const list = [extension("fixed"), extension("work"), { ...extension("app"), type: "hosted_app" }]
  const config = options({ isShowFixedExtension: false })
  config.groups = [{ id: "fixed", extensions: ["fixed"] }]
  let result
  function Search({ group }) {
    result = useSearchController(list, config, group)
    return null
  }
  const selected = { id: "work", extensions: ["work"] }
  renderToStaticMarkup(React.createElement(Search, { group: selected }))
  assert.deepEqual(
    result[0].map((item) => item.id),
    ["work"]
  )
  assert.deepEqual(
    result[1].map((item) => item.id),
    ["app"]
  )
  assert.equal(result[4], selected)
  renderToStaticMarkup(React.createElement(Search, { group: config.groups[0] }))
  assert.deepEqual(
    result[0].map((item) => item.id),
    ["fixed"]
  )
  renderToStaticMarkup(React.createElement(Search, {}))
  assert.deepEqual(
    result[0].map((item) => item.id),
    ["work"]
  )
})

test("a selected no-group filter follows current extensions and group membership", () => {
  const { load } = modelHarness()
  const { useSearchController } = load("src/pages/Popup/hooks/useSearchController.js")
  const config = options()
  config.groups = [{ id: "work", extensions: ["a"] }]
  const selected = { id: "__no_group__", name: "No group", extensions: ["a"] }
  let result
  function Search() {
    result = useSearchController([extension("a"), extension("new")], config, selected)
    return null
  }
  renderToStaticMarkup(React.createElement(Search))
  assert.deepEqual(
    result[0].map((item) => item.id),
    ["new"]
  )
  config.groups = [{ id: "work", extensions: ["new"] }]
  renderToStaticMarkup(React.createElement(Search))
  assert.deepEqual(
    result[0].map((item) => item.id),
    ["a"]
  )
  assert.deepEqual(selected.extensions, ["a"])
})

for (const selected of [
  { id: "__no_group__", name: "No group", extensions: ["normal"] },
  { id: "work", name: "Work", extensions: ["normal", "hosted", "packaged", "legacy"] }
]) {
  test(`${selected.id} keeps all app types out of plugin rows and independently searchable`, () => {
    const { load } = modelHarness()
    const { useSearchController } = load("src/pages/Popup/hooks/useSearchController.js")
    const list = [
      extension("normal"),
      { ...extension("hosted"), name: "Mail", type: "hosted_app" },
      { ...extension("packaged"), name: "Calendar", type: "packaged_app" },
      { ...extension("legacy"), name: "Notes", type: "legacy_packaged_app" }
    ]
    const config = options({ isShowApp: false })
    if (selected.id === "work") config.groups = [selected]
    const before = structuredClone({ list, config, selected })
    let result
    function Search({ text }) {
      const [searched, setSearched] = React.useState(false)
      result = useSearchController(list, config, selected)
      if (text && !searched) {
        setSearched(true)
        result[2](text)
      }
      return null
    }
    renderToStaticMarkup(React.createElement(Search))
    assert.deepEqual(
      result[0].map((item) => item.id),
      ["normal"]
    )
    assert.deepEqual(
      result[1].map((item) => item.id),
      ["hosted", "packaged", "legacy"]
    )
    for (const [text, expectedId] of [
      ["Mail", "hosted"],
      ["Calendar", "packaged"],
      ["Notes", "legacy"]
    ]) {
      renderToStaticMarkup(React.createElement(Search, { text }))
      assert.deepEqual(result[0], [])
      assert.deepEqual(
        result[1].map((item) => item.id),
        [expectedId]
      )
    }
    assert.deepEqual({ list, config, selected }, before)
  })
}

test("top candidates avoid tab access when no enabled rule requests pinning", async () => {
  const { load, calls } = modelHarness()
  const { findTopExtensions } = load("src/pages/Popup/utils/usePopupExtensions.js")
  for (const rules of [
    undefined,
    [],
    [{ ...topRule(["a"]), enable: false }],
    [{ ...topRule(["a"]), action: { showOnTheTop: false } }]
  ]) {
    assert.deepEqual(
      await findTopExtensions([extension("a")], { ...options(), ruleConfig: rules }),
      []
    )
  }
  assert.equal(calls.tabs, 0)
})

test("group target expansion leaves stored rule and group arrays unchanged", async () => {
  const { load } = modelHarness()
  const { findTopExtensions } = load("src/pages/Popup/utils/usePopupExtensions.js")
  const config = options()
  config.ruleConfig = [topRule(["b"], ["group"])]
  config.groups = [{ id: "group", extensions: ["a"] }]
  const before = structuredClone(config)
  assert.deepEqual(await findTopExtensions([extension("a"), extension("b")], config), ["a", "b"])
  assert.deepEqual(config, before)
})

test("independent top sources and recent record reads overlap without changing precedence", async () => {
  const query = deferred()
  const first = deferred()
  const second = deferred()
  const now = Date.now()
  const { load, calls } = modelHarness({
    query: () => query.promise,
    recently: async () => ["manual", "rule"],
    keys: async () => ["older", "newer"],
    record: (id) => (id === "older" ? first.promise : second.promise)
  })
  const { findTopExtensions } = load("src/pages/Popup/utils/usePopupExtensions.js")
  const config = options({ isTopRecentlyEnabled: true, isTopRecentlyUpdate: true })
  config.ruleConfig = [topRule(["rule"])]
  const result = findTopExtensions([extension("rule")], config)
  await flush()
  assert.equal(calls.recent, 1)
  assert.deepEqual(calls.records, ["older", "newer"])
  first.resolve({ id: "older", installDate: now - 100 })
  second.resolve({ id: "newer", installDate: now })
  query.resolve([{ url: "https://example.com" }])
  assert.deepEqual(await result, ["rule", "manual", "newer", "older"])
})

for (const [filename, exportName] of [
  ["usePopupExtensions", "usePopupExtensions"],
  ["usePopupExtensionsByGroup", "usePopupExtensionsByGroup"]
]) {
  test(`${exportName} rejects superseded and unmounted async results`, async () => {
    const reads = [deferred(), deferred(), deferred()]
    let read = 0
    const view = effectHarness({ recently: () => reads[read++].promise })
    const hook = view.load(`src/pages/Popup/utils/${filename}.js`)[exportName]
    const config = options({ isTopRecentlyEnabled: true })
    hook([extension("old")], config, "")
    hook([extension("new")], config, "")
    await flush()
    reads[1].resolve([])
    await flush()
    assert.equal(view.commits.length, 1)
    assert.match(JSON.stringify(view.commits[0]), /"new"/)
    reads[0].resolve([])
    await flush()
    assert.equal(view.commits.length, 1)
    hook([extension("closed")], config, "")
    await flush()
    view.dispose()
    reads[2].resolve([])
    await flush()
    assert.equal(view.commits.length, 1)
  })

  test(`${exportName} reads frequency order once for a complete build`, async () => {
    const view = effectHarness({ order: async () => ["b", "a"] })
    const hook = view.load(`src/pages/Popup/utils/${filename}.js`)[exportName]
    const config = options({ isSortByFrequency: true, defaultSortField: "enable" })
    config.ruleConfig = [topRule(["top"])]
    config.groups = [{ id: "work", name: "Work", extensions: ["a", "b"] }]
    hook([extension("a"), extension("b"), extension("top"), extension("c", false)], config, "")
    await flush()
    assert.equal(view.calls.order, 1)
    if (filename === "usePopupExtensions") {
      assert.deepEqual(
        view.commits[0].enabled.map((item) => item.id),
        ["b", "a"]
      )
      assert.deepEqual(
        view.commits[0].top.map((item) => item.id),
        ["top"]
      )
    } else {
      assert.deepEqual(
        view.commits[0][1].extensions.map((item) => item.id),
        ["b", "a"]
      )
      assert.deepEqual(
        view.commits[0].at(-1).extensions.map((item) => item.id),
        ["top", "c"]
      )
    }
  })
}

test("an empty visible result clears an earlier ordinary popup list", async () => {
  const view = effectHarness()
  const { usePopupExtensions } = view.load("src/pages/Popup/utils/usePopupExtensions.js")
  const config = options()
  usePopupExtensions([extension("a")], config, "")
  await flush()
  assert.deepEqual(
    view.commits[0].enabled.map((item) => item.id),
    ["a"]
  )
  config.groups = [{ id: "hidden", extensions: ["a"] }]
  usePopupExtensions([extension("a")], config, "")
  await flush()
  assert.deepEqual(view.commits.at(-1), { top: [], enabled: [], disabled: [] })
})

test("the list renders prepared sections immediately without pinning shared extension objects", () => {
  const top = extension("top")
  const sections = {
    top: [top],
    enabled: [extension("enabled")],
    disabled: [extension("disabled", false)]
  }
  const source = readFileSync(
    new URL("../src/pages/Popup/Components/list-view/ExtensionListView.jsx", import.meta.url),
    "utf8"
  )
  const code = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.React,
      esModuleInterop: true
    }
  }).outputText
  const stubs = {
    react: React,
    "styled-components": { styled: { ul: () => "ul" } },
    "../../utils/usePopupExtensions": { usePopupExtensions: () => [sections] },
    "./ExtensionListItem": ({ item, isTop }) => {
      if (item.id === "top") assert.equal(item, top)
      return React.createElement("span", { "data-top": Boolean(isTop ?? item.__top__) }, item.id)
    }
  }
  const module = { exports: {} }
  new Function("require", "module", "exports", code)((name) => stubs[name], module, module.exports)
  const html = renderToStaticMarkup(
    React.createElement(module.exports.default, { extensions: [], options: options() })
  )
  assert.match(html, /<span data-top="true">top<\/span>/)
  assert.ok(html.indexOf(">top<") < html.indexOf(">enabled<"))
  assert.ok(html.indexOf(">enabled<") < html.indexOf(">disabled<"))
  assert.equal(top.__top__, undefined)
})
