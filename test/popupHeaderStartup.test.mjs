import assert from "node:assert/strict"
import fs from "node:fs"
import { createRequire } from "node:module"
import test from "node:test"
import ts from "typescript"

import { createSourceLoader, deferred, flush } from "./helpers/loadSource.mjs"

const require = createRequire(import.meta.url)
const React = require("react")
const loadSource = createSourceLoader({
  ".../storage/sync": {},
  "webext-polyfill-kinda": {},
  ".../utils/messageHelper": {},
  ".../utils/channelHelper": {},
  "../assets/img/puzzle.svg": "",
  "./utils": {}
})
const extensionHelper = loadSource("src/utils/extensionHelper.js")
const groupHelper = loadSource("src/pages/Popup/utils/popupGroupHelper.js")
const extensionActions = loadSource("src/pages/Popup/ExtensionOnOffHandler.js")

// Exercise the real JSX and event handlers without mounting browser-only UI dependencies.
function mount(filename, stubs, initialProps, globals = {}) {
  const slots = []
  const effects = []
  const layoutEffects = []
  let position = 0
  let props = initialProps
  let tree
  const same = (a, b) => a && b && a.length === b.length && a.every((v, i) => Object.is(v, b[i]))
  const effect = (queue, callback, deps) => {
    const index = position++
    if (same(slots[index]?.deps, deps)) return
    const old = slots[index]
    slots[index] = { deps, cleanup: old?.cleanup }
    queue.push(() => {
      old?.cleanup?.()
      slots[index].cleanup = callback()
    })
  }
  const react = {
    ...React,
    memo: (component) => component,
    useState(value) {
      const index = position++
      if (!(index in slots)) slots[index] = typeof value === "function" ? value() : value
      return [
        slots[index],
        (next) => {
          slots[index] = typeof next === "function" ? next(slots[index]) : next
        }
      ]
    },
    useRef(value) {
      const index = position++
      return (slots[index] ??= { current: value })
    },
    useMemo(callback, deps) {
      const index = position++
      if (!same(slots[index]?.deps, deps)) slots[index] = { deps, value: callback() }
      return slots[index].value
    },
    useEffect: (callback, deps) => effect(effects, callback, deps),
    useLayoutEffect: (callback, deps) => effect(layoutEffects, callback, deps)
  }
  const code = ts.transpileModule(
    fs.readFileSync(new URL(`../src/pages/Popup/Components/${filename}`, import.meta.url), "utf8"),
    {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        jsx: ts.JsxEmit.React,
        esModuleInterop: true
      }
    }
  ).outputText
  const module = { exports: {} }
  new Function("require", "module", "exports", ...Object.keys(globals), code)(
    (name) => (name === "react" ? react : (stubs[name] ?? require(name))),
    module,
    module.exports,
    ...Object.values(globals)
  )
  const render = (nextProps = props) => {
    props = nextProps
    position = 0
    tree = module.exports.default(props)
    return tree
  }
  render()
  return {
    render,
    runEffects() {
      for (const callback of effects.splice(0)) callback()
    },
    runLayoutEffects() {
      for (const callback of layoutEffects.splice(0)) callback()
    },
    elements() {
      const result = []
      const visit = (element) => {
        if (!element?.props) return
        result.push(element)
        for (const child of [element.props.children].flat()) visit(child)
      }
      visit(tree)
      return result
    },
    menu() {
      return this.elements().find((element) => element.type === "dropdown").props.menu
    },
    title() {
      return this.elements().find((element) => element.props.className === "menu-item-text").props
        .children
    }
  }
}

const groups = [
  { id: "work", name: "Work", extensions: ["a"] },
  { id: "play", name: "Play", extensions: ["b"] }
]
const options = {
  setting: {},
  scenes: [
    { id: "office", name: "Office" },
    { id: "home", name: "Home" }
  ]
}
const ui = {
  "@ant-design/icons": { CaretDownOutlined: "caret" },
  antd: { Dropdown: "dropdown", Space: "space" },
  "styled-components": { styled: { div: () => "div" } },
  ".../utils/utils": { getLang: (key) => key },
  "./MenuStyle": { MenuStyle: "menu-style" },
  "./GroupStateToggle": "group-toggle",
  "./SceneStateToggle": "scene-toggle"
}

function groupView(extraProps = {}, stored = Promise.resolve("work")) {
  const reads = []
  const writes = []
  const changes = []
  const props = {
    options,
    groups,
    extensions: [],
    onGroupChanged: (group) => changes.push(group),
    ...extraProps
  }
  const view = mount(
    "header/SingleGroupDropdown.jsx",
    {
      ...ui,
      ".../storage/local/LocalOptions": {
        LocalOptions: class {
          getActiveGroupId() {
            reads.push(true)
            return stored
          }
          setActiveGroupId(id) {
            writes.push(id)
          }
        }
      },
      ".../utils/extensionHelper": extensionHelper,
      "../../ExtensionOnOffHandler": extensionActions,
      "../../utils/popupGroupHelper": groupHelper
    },
    props
  )
  return { view, props, reads, writes, changes }
}

test("saved startup group is visible on first render and avoids another storage read", () => {
  const { view, reads, changes } = groupView({ initialGroup: groups[0] })
  assert.equal(view.title(), "Work")
  view.runEffects()
  assert.deepEqual(reads, [])
  assert.deepEqual(changes, [])
})

test("explicit all-groups startup state skips the legacy restore", async () => {
  const { view, reads } = groupView({ initialGroup: null })
  view.runEffects()
  await flush()
  view.render()
  assert.equal(view.title(), "group_select_all")
  assert.deepEqual(reads, [])
})

test("popup apps do not add configured groups or dropdown entries", async () => {
  for (const isShowApp of [false, true]) {
    const config = {
      ...options,
      setting: { isShowApp },
      groups: structuredClone(groups)
    }
    const before = structuredClone(config)
    const { view, writes } = groupView({
      options: config,
      groups: config.groups,
      initialGroup: null,
      extensions: [
        { id: "a", name: "Extension", type: "extension", enabled: true },
        { id: "hosted", name: "App", type: "hosted_app", enabled: true },
        { id: "packaged", name: "App", type: "packaged_app", enabled: true },
        { id: "legacy", name: "App", type: "legacy_packaged_app", enabled: false }
      ]
    })
    view.runEffects()
    await flush()
    view.render()
    assert.deepEqual(
      view.menu().items.map((item) => item.key),
      ["all", "work", "play", "__no_group__"]
    )
    assert.deepEqual(config, before)
    assert.deepEqual(writes, [])
  }
})

test("a late saved-group read cannot overwrite a manual group selection", async () => {
  const stored = deferred()
  const { view, changes, writes } = groupView({}, stored.promise)
  view.runEffects()
  view.menu().onClick({ key: "play" })
  stored.resolve("work")
  await flush()
  view.render()
  assert.equal(view.title(), "Play")
  assert.deepEqual(changes, [groups[1]])
  assert.deepEqual(writes, ["play"])
})

test("extension updates keep the chosen group without restoring storage again", async () => {
  const { view, props, reads, changes } = groupView()
  view.runEffects()
  await flush()
  view.render()
  view.menu().onClick({ key: "play" })
  view.render({ ...props, extensions: [{ id: "new", type: "extension", enabled: true }] })
  view.runEffects()
  await flush()
  view.render()
  assert.equal(view.title(), "Play")
  assert.equal(reads.length, 1)
  assert.deepEqual(changes, [groups[0], groups[1]])
})

test("legacy restore still clears a deleted saved group", async () => {
  const { view, changes, writes } = groupView({}, Promise.resolve("deleted"))
  view.runEffects()
  await flush()
  view.render()
  assert.equal(view.title(), "group_select_all")
  assert.deepEqual(changes, [null])
  assert.deepEqual(writes, [null])
})

function sceneView(extraProps = {}, stored = Promise.resolve(["office"])) {
  let reads = 0
  const notifications = []
  const actions = []
  const props = { options, ...extraProps }
  const view = mount(
    "header/SceneDropdown.jsx",
    {
      ...ui,
      ".../storage/sync": {
        scene: {
          getActiveIds() {
            reads++
            return stored
          },
          async setActiveState(id, active, exclusive) {
            actions.push({ id, active, exclusive })
            return active ? [id] : []
          },
          async setActiveIds(ids) {
            return ids
          }
        }
      },
      ".../utils/messageHelper": {
        sendMessage: async (id, params) => notifications.push({ id, params })
      }
    },
    props
  )
  return {
    view,
    props,
    actions,
    notifications,
    get reads() {
      return reads
    }
  }
}

test("startup scenes are visible immediately without a second active-scene read", () => {
  const state = sceneView({ initialActiveSceneIds: ["office"] })
  assert.equal(state.view.title(), "Office")
  state.view.runEffects()
  state.view.render({ ...state.props, options: { ...options } })
  state.view.runEffects()
  assert.equal(state.reads, 0)
})

test("an empty startup scene snapshot stays empty and skips storage", async () => {
  const state = sceneView({ initialActiveSceneIds: [] })
  state.view.runEffects()
  await flush()
  state.view.render()
  assert.equal(state.view.title(), "scene_title")
  assert.equal(state.reads, 0)
})

test("a late scene restore cannot replace a scene the user just activated", async () => {
  const stored = deferred()
  const { view, actions, notifications } = sceneView({}, stored.promise)
  view.runEffects()
  await view.menu().onClick({ key: "home" })
  stored.resolve(["office"])
  await flush()
  view.render()
  assert.equal(view.title(), "Home")
  assert.deepEqual(actions, [{ id: "home", active: true, exclusive: false }])
  assert.deepEqual(notifications, [{ id: "current-scenes-changed", params: { ids: ["home"] } }])
})

test("legacy scene restore remains available without a startup snapshot", async () => {
  const state = sceneView()
  state.view.runEffects()
  await flush()
  state.view.render()
  assert.equal(state.view.title(), "Office")
  assert.equal(state.reads, 1)
})

test("header height is ready before paint while search focus remains available", () => {
  for (const isShowSearchBarDefault of [true, false]) {
    const heights = []
    let focused = 0
    const view = mount(
      "Header.jsx",
      {
        ...ui,
        antd: { Space: "space", message: { useMessage: () => [{}, null] } },
        "@ant-design/icons/lib/components/Icon": "icon",
        ".../assets/img/Microsoft_Store.svg": "",
        ".../assets/img/chrome-web-store-icon.svg": "",
        ".../assets/img/design-devin/Dark.svg": "",
        ".../assets/img/design-devin/Light.svg": "",
        ".../storage/sync": {},
        ".../utils/channelHelper": {},
        "./HeaderStyle": { __esModule: true, default: "header", SearchStyle: "search" },
        "./header/GroupDropdown": "groups",
        "./header/SceneDropdown": "scenes",
        "./header/MoreOperationDropdown": "more"
      },
      { options: { setting: { isShowSearchBarDefault } } },
      {
        document: {
          documentElement: { style: { setProperty: (...args) => heights.push(args) } },
          addEventListener() {},
          removeEventListener() {}
        }
      }
    )
    const input = view.elements().find((element) => element.type === "input")
    if (input) input.props.ref.current = { focus: () => focused++ }
    view.runLayoutEffects()
    assert.deepEqual(heights, [["--header-height", isShowSearchBarDefault ? "72px" : "42px"]])
    view.runEffects()
    assert.equal(focused, isShowSearchBarDefault ? 1 : 0)
  }
})

test("snapshot menu reads values together and preserves newest-first display", async () => {
  const older = deferred()
  const newer = deferred()
  const reads = []
  const view = mount(
    "header/MoreOperationDropdown.jsx",
    {
      ...ui,
      localforage: {
        createInstance: () => ({
          async keys() {
            return ["older", "newer"]
          },
          getItem(key) {
            reads.push(key)
            return key === "older" ? older.promise : newer.promise
          }
        })
      },
      "./MoreOperationDropdownStyle.js": { MoreOperationDropdownSnapshotStyle: "snapshot" }
    },
    { options, messageApi: {} }
  )
  view.runEffects()
  await flush()
  assert.deepEqual(reads, ["older", "newer"])
  newer.resolve({ key: "newer", name: "Newer", states: [] })
  older.resolve({ key: "older", name: "Older", states: [] })
  await flush()
  view.render()
  const restore = view.menu().items.find((item) => item.key === "restore-snapshot")
  assert.deepEqual(
    restore.children.map((item) => item.key),
    ["newer", "older", "delete-all-snapshot"]
  )
})
