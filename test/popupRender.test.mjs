import assert from "node:assert/strict"
import fs from "node:fs"
import { createRequire } from "node:module"
import test from "node:test"
import ts from "typescript"

const require = createRequire(import.meta.url)
const realReact = require("react")

function hooks() {
  const instances = new Map()
  let values = []
  let dependencies = []
  const effects = []
  let cursor = 0
  return {
    react: {
      ...realReact,
      memo: (component) => component,
      useState(initial) {
        const index = cursor++
        if (!(index in values)) values[index] = typeof initial === "function" ? initial() : initial
        return [
          values[index],
          (value) => {
            values[index] = typeof value === "function" ? value(values[index]) : value
          }
        ]
      },
      useRef(initial) {
        const index = cursor++
        return (values[index] ??= { current: initial })
      },
      useCallback: (callback) => callback,
      useEffect(effect, deps) {
        const index = cursor++
        if (!dependencies[index] || deps.some((value, i) => value !== dependencies[index][i])) {
          effects.push(effect)
          dependencies[index] = deps
        }
      }
    },
    render(component, props) {
      cursor = 0
      if (!instances.has(component)) instances.set(component, { values: [], dependencies: [] })
      const instance = instances.get(component)
      values = instance.values
      dependencies = instance.dependencies
      return component(props)
    },
    effects() {
      effects.splice(0).forEach((effect) => effect())
    }
  }
}

function loadSource(path, stubs, globals = {}) {
  const code = ts.transpileModule(fs.readFileSync(new URL(`../${path}`, import.meta.url), "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.React,
      esModuleInterop: true
    }
  }).outputText
  const module = { exports: {} }
  new Function("require", "module", "exports", ...Object.keys(globals), code)(
    (name) => (Object.hasOwn(stubs, name) ? stubs[name] : require(name)),
    module,
    module.exports,
    ...Object.values(globals)
  )
  return module.exports
}

function elements(tree) {
  if (!tree?.props) return []
  return [tree, ...[tree.props.children].flat(Infinity).flatMap(elements)]
}

const styled = new Proxy(() => {}, { get: () => () => "section" })
const item = { id: "example", name: "Example", enabled: true, optionsUrl: "", homepageUrl: "" }
const options = { setting: {}, groups: [{ id: "fixed", extensions: ["example"] }] }

function itemStubs(harness) {
  return {
    react: harness.react,
    "@ant-design/icons": new Proxy({}, { get: (_, name) => name }),
    antd: {
      Space: "span",
      Button: "button",
      Switch: "input",
      message: {
        useMessage: () => [{ info() {} }, null]
      }
    },
    "./ExtensionListItem.css": {},
    "../common/ExtensionIcon": "img",
    ".../storage/local/ManualEnableCounter": {
      ManualEnableCounter: class {
        count() {}
      }
    },
    ".../utils/channelHelper": {},
    ".../utils/extensionHelper.js": {
      getIcon: () => "icon",
      getHomepageUrl() {},
      getOriginSettingUrl() {}
    },
    ".../utils/utils": { getLang: (key) => key },
    ".../utils/utils.js": { isStringEmpty: (value) => !value },
    "../../hooks/useExtensionItemPin": { useExtensionItemPin: () => [true, () => {}] },
    "./ExtensionGridItemStyle": { ExtensionGridItemStyle: "section" }
  }
}

function grid(rightClick = false) {
  const harness = hooks()
  const reads = []
  const timers = []
  const component = loadSource(
    "src/pages/Popup/Components/grid-view/ExtensionGridItem.jsx",
    itemStubs(harness),
    {
      window: { innerWidth: 400, innerHeight: 300 },
      setTimeout: (callback) => timers.push(callback)
    }
  ).default
  const props = {
    item,
    options: { ...options, setting: { isMenuDisplayByRightClick: rightClick } }
  }
  const render = () => harness.render(component, props)
  const tree = render()
  for (const element of elements(tree).filter((element) => element.props.ref)) {
    const name = element.props.className?.includes("operation-menu")
      ? "menu"
      : element.props.className?.includes("grid-name-tooltip")
        ? "tooltip"
        : "item"
    const node = {
      style: {},
      addEventListener() {},
      removeEventListener() {},
      getBoundingClientRect() {
        reads.push({ name, visibility: node.style.visibility })
        if (name === "item")
          return { left: 320, right: 362, top: 250, bottom: 292, width: 42, height: 42 }
        const shown = node.style.display === "block" || element.props.className.includes("menu-on")
        return name === "menu" ? { width: shown ? 162 : 0, height: 72 } : { width: 120, height: 30 }
      }
    }
    element.props.ref.current = node
  }
  return { harness, reads, render, tree, timers }
}

test("an idle grid item does no layout reads, and hover positions hidden overlays before reveal", () => {
  const view = grid()
  view.harness.effects()
  assert.deepEqual(view.reads, [], "mount must not measure invisible overlays")
  view.tree.props.onMouseEnter()
  assert.equal(view.reads.filter((read) => read.name === "menu").length, 1)
  assert.equal(view.reads.find((read) => read.name === "menu").visibility, "hidden")
  const shown = elements(view.render())
  assert.match(
    shown.find((element) => element.props.className?.includes("operation-menu ")).props.className,
    /menu-left/
  )
  assert.deepEqual(
    shown.find((element) => element.props.className?.includes("grid-name-tooltip ")).props.style,
    { top: 209, left: 274 }
  )
  view.reads.length = 0
  view.harness.effects()
  view.tree.props.onMouseLeave()
  view.timers.forEach((callback) => callback())
  view.render()
  view.harness.effects()
  assert.deepEqual(view.reads, [], "hiding overlays must not measure them")
})

test("right-click menus measure on the first click and retain immediate animation timing", () => {
  const view = grid(true)
  view.harness.effects()
  view.tree.props.onMouseEnter()
  assert.equal(view.reads.filter((read) => read.name === "menu").length, 0)
  view.reads.length = 0
  view.tree.props.onMouseUpCapture({ button: 2 })
  assert.equal(view.reads.filter((read) => read.name === "menu").length, 1)
  const shown = view.render()
  assert.equal(shown.props.animation_delay, 0)
  const menu = elements(shown).find((element) =>
    element.props.className?.includes("operation-menu ")
  )
  assert.match(menu.props.className, /menu-left/)
  assert.match(menu.props.className, /menu-on/)
})

test("fixed extension indicators are correct on the first render", () => {
  const pin = hooks()
  const usePin = loadSource("src/pages/Popup/hooks/useExtensionItemPin.js", {
    react: pin.react,
    ".../storage/sync": {}
  }).useExtensionItemPin
  assert.equal(pin.render(() => usePin(item, options))[0], true)
})

test("always-visible operations are present on the first render", () => {
  const list = hooks()
  const component = loadSource(
    "src/pages/Popup/Components/list-view/ExtensionListItem.jsx",
    itemStubs(list)
  ).default
  const tree = list.render(component, {
    item,
    options: { ...options, setting: { isShowItemOperationAlways: true } }
  })
  assert.ok(elements(tree).some((element) => element.props.className === "li-operation"))
})

test("list top styling follows section membership without changing the shared extension", () => {
  const view = hooks()
  const component = loadSource(
    "src/pages/Popup/Components/list-view/ExtensionListItem.jsx",
    itemStubs(view)
  ).default
  for (const isTop of [true, false]) {
    const extension = { ...item, __top__: !isTop }
    const tree = view.render(component, { item: extension, options, isTop })
    assert.equal(tree.props.className.includes("item-is-top"), isTop)
    assert.equal(extension.__top__, !isTop)
  }
})

test("fold headings restore their preloaded state immediately and persist user toggles", () => {
  const view = hooks()
  const writes = []
  const component = loadSource("src/pages/Popup/Components/common/FoldGroupName.jsx", {
    react: view.react,
    "@ant-design/icons": { CaretDownOutlined: "down", CaretRightOutlined: "right" },
    antd: { Space: "span" },
    "styled-components": { __esModule: true, default: styled },
    localforage: { createInstance: () => ({ getItem: async () => true }) },
    "../../utils/popupGroupFolds": { savePopupGroupFold: (...args) => writes.push(args) }
  }).default
  const changes = []
  const props = {
    group: { id: "group", name: "Group" },
    initialFolded: true,
    onFoldChanged: (fold) => changes.push(fold)
  }
  let tree = view.render(component, props)
  assert.ok(elements(tree).some((element) => element.type === "right"))
  view.effects()
  assert.deepEqual(changes, [true])
  elements(tree)
    .find((element) => element.props.className === "fold-text")
    .props.onClick()
  tree = view.render(component, props)
  view.effects()
  assert.ok(elements(tree).some((element) => element.type === "down"))
  assert.deepEqual(changes, [true, false])
  assert.deepEqual(writes, [["group", false]])
})

test("fold storage is read once and failures use expanded groups", async () => {
  let reads = 0
  const writes = []
  const api = loadSource("src/pages/Popup/utils/popupGroupFolds.js", {
    localforage: {
      LOCALSTORAGE: "localStorage",
      createInstance: (config) => {
        assert.equal(config.name, "LocalOptions")
        assert.equal(config.storeName, "popupGroupExpand")
        return {
          async iterate(visit) {
            reads++
            visit(true, "one")
            visit(false, "two")
          },
          async setItem(...args) {
            writes.push(["set", ...args])
          },
          async removeItem(...args) {
            writes.push(["remove", ...args])
          }
        }
      }
    }
  })
  const [first, second] = await Promise.all([api.loadPopupGroupFolds(), api.loadPopupGroupFolds()])
  assert.equal(reads, 1)
  assert.equal(first, second)
  assert.deepEqual({ ...first }, { one: true, two: false })
  await api.savePopupGroupFold("one", false)
  await api.savePopupGroupFold("two", true)
  assert.deepEqual({ ...(await api.loadPopupGroupFolds()) }, { one: false, two: true })
  assert.deepEqual(writes, [
    ["remove", "one"],
    ["set", "two", true]
  ])
  const failed = loadSource("src/pages/Popup/utils/popupGroupFolds.js", {
    localforage: {
      createInstance: () => ({
        iterate: async () => {
          throw new Error("unavailable")
        }
      })
    }
  })
  assert.deepEqual(await failed.loadPopupGroupFolds(), {})
})

for (const kind of ["list", "grid"]) {
  test(`${kind} folded groups skip initial rows and keep mounted rows during later collapse`, () => {
    const view = hooks()
    const group = { id: "folded", name: "Folded", extensions: [item] }
    const foldName = () => null
    const component = loadSource(
      `src/pages/Popup/Components/${kind}-view/Extension${kind === "list" ? "List" : "Grid"}ViewByGroup.jsx`,
      {
        react: view.react,
        "styled-components": { __esModule: true, default: styled, styled },
        "../../utils/usePopupExtensionsByGroup": { usePopupExtensionsByGroup: () => [[group]] },
        "../common/FoldGroupName": { __esModule: true, default: foldName },
        [`./Extension${kind === "list" ? "List" : "Grid"}Item`]: {
          __esModule: true,
          default: "row"
        },
        "./ExtensionGridView": { GridViewSpaceStyle: "section" }
      }
    ).default
    const tree = view.render(component, {
      extensions: [item],
      options,
      initialFoldedGroups: { folded: true }
    })
    const space = elements(tree).find((element) => typeof element.type === "function")
    const content = view
    let section = content.render(space.type, space.props)
    assert.equal(elements(section).filter((element) => element.type === "row").length, 0)
    elements(section)
      .find((element) => element.type === foldName)
      .props.onFoldChanged(false)
    section = content.render(space.type, space.props)
    assert.equal(elements(section).filter((element) => element.type === "row").length, 1)
    elements(section)
      .find((element) => element.type === foldName)
      .props.onFoldChanged(true)
    section = content.render(space.type, space.props)
    assert.equal(elements(section).filter((element) => element.type === "row").length, 1)
    assert.ok(elements(section).some((element) => element.props.className === "hide-list"))
  })
}
