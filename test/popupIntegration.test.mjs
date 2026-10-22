import assert from "node:assert/strict"
import { test } from "node:test"

import { createSourceLoader, deferred, flush } from "./helpers/loadSource.mjs"

function harness() {
  const states = []
  const effects = []
  let cursor = 0
  const react = {
    createElement: (type, props, ...children) => ({ type, props: { ...props, children } }),
    useState(initial) {
      const index = cursor++
      if (!(index in states)) states[index] = typeof initial === "function" ? initial() : initial
      return [
        states[index],
        (value) => {
          states[index] = typeof value === "function" ? value(states[index]) : value
        }
      ]
    },
    useCallback: (fn) => fn,
    useMemo: (fn) => fn(),
    useEffect: (effect) => effects.push(effect),
    useLayoutEffect() {}
  }
  const event = () => ({
    addListener(fn) {
      this.listener = fn
    },
    removeListener() {}
  })
  const chrome = { management: { onEnabled: event(), onDisabled: event() } }
  let searchedGroup
  const isExtExtension = (extension) => extension.type === "extension"
  const load = createSourceLoader(
    {
      react,
      "styled-components": { styled: { div: () => "PopupStyle" } },
      ".../pages/Popup/utils/popupLayoutHelper": { applyPopupWidth() {} },
      "../../../utils/extensionHelper.js": { isExtExtension },
      "../ExtensionOnOffHandler.js": {},
      "../hooks/useSearchController": {
        useSearchController: (extensions, _options, initialGroup) => {
          searchedGroup = initialGroup
          return [
            extensions,
            extensions.filter((item) => item.type === "hosted_app"),
            () => {},
            () => {},
            initialGroup
          ]
        }
      },
      "./AppList": "AppList",
      "./Header": "Header",
      "./common/ExtensionIcon": { PopupIconContext: { Provider: "IconProvider" } },
      "./grid-view/ExtensionGridView.jsx": "Grid",
      "./grid-view/ExtensionGridViewByGroup.jsx": "GroupedGrid",
      "./list-view/ExtensionListView": "List",
      "./list-view/ExtensionListViewByGroup.jsx": "GroupedList",
      localforage: { INDEXEDDB: "idb", createInstance: () => ({}) }
    },
    { chrome, window: { addEventListener() {}, removeEventListener() {} } }
  )
  const Popup = load("src/pages/Popup/Components/Popup.jsx").default
  const icons = deferred()
  const initialGroup = { id: "work", extensions: ["a"] }
  const props = {
    originExtensions: [
      { id: "a", version: "1", type: "extension", name: "Current", enabled: true }
    ],
    options: {
      setting: { layout: "list", isDisplayByGroup: true, isShowApp: true },
      groups: [],
      management: { extensions: [] }
    },
    params: {
      initialGroup,
      activeSceneIds: ["scene"],
      initialFoldedGroups: { work: true },
      iconEnhancement: icons.promise
    }
  }
  const render = () => {
    cursor = 0
    return Popup(props)
  }
  return {
    render,
    props,
    effects,
    chrome,
    icons,
    get searchedGroup() {
      return searchedGroup
    }
  }
}

function childrenOfType(element, type) {
  if (!element || typeof element !== "object") return []
  return [
    ...(element.type === type ? [element] : []),
    ...(element.props?.children ?? []).flatMap((child) => childrenOfType(child, type))
  ]
}

test("the first popup render has correct counts and prepared group, scene and fold state", () => {
  const h = harness()
  const view = h.render()
  const header = childrenOfType(view, "Header")[0]
  assert.equal(header.props.activeCount, 1)
  assert.equal(header.props.totalCount, 1)
  assert.equal(h.searchedGroup, h.props.params.initialGroup)
  assert.equal(header.props.initialGroup, h.props.params.initialGroup)
  assert.deepEqual(header.props.initialActiveSceneIds, ["scene"])
  assert.deepEqual(childrenOfType(view, "GroupedList")[0].props.initialFoldedGroups, { work: true })
})

test("late cached icons cannot undo an enable-state event received by the popup", async () => {
  const h = harness()
  h.render()
  h.effects.forEach((effect) => effect())
  h.chrome.management.onDisabled.listener({ id: "a" })
  h.icons.resolve([{ id: "a", version: "1", name: "Old", enabled: true, icon: "data:a" }])
  await flush()
  const view = h.render()
  const list = childrenOfType(view, "GroupedList")[0].props.extensions
  assert.equal(list[0].enabled, false)
  assert.equal(list[0].name, "Current")
  assert.equal(childrenOfType(view, "IconProvider")[0].props.value.get("a").icon, "data:a")
})

test("late icons do not rebuild the list when enable/disable refresh is turned off", async () => {
  const h = harness()
  h.props.options.setting.isRefreshAfterEnableDisable = false
  h.props.originExtensions.push({ id: "z", version: "1", type: "extension", enabled: false })
  const before = childrenOfType(h.render(), "GroupedList")[0].props.extensions
  h.effects.forEach((effect) => effect())
  // Row-local actions intentionally retain the existing sections until the next open.
  before[1].enabled = true
  h.chrome.management.onEnabled.listener({ id: "z" })
  h.icons.resolve(before.map((item) => ({ ...item, icon: `data:${item.id}` })))
  await flush()
  const after = childrenOfType(h.render(), "GroupedList")[0].props.extensions
  assert.equal(after, before, "icon-only data must stay out of the list model dependencies")
})

for (const layout of ["list", "grid"]) {
  for (const grouped of [false, true]) {
    test(`${layout} popup (grouped=${grouped}) shows apps last only when enabled`, () => {
      for (const isShowApp of [false, true]) {
        const h = harness()
        const app = { id: "app", name: "App", type: "hosted_app", enabled: true }
        h.props.originExtensions.push(app)
        Object.assign(h.props.options.setting, { layout, isDisplayByGroup: grouped, isShowApp })
        h.props.options.groups = [h.props.params.initialGroup]
        const groupsBefore = structuredClone(h.props.options.groups)
        const view = h.render()
        const apps = childrenOfType(view, "AppList")
        assert.equal(apps.length, isShowApp ? 1 : 0)
        if (isShowApp) {
          assert.deepEqual(apps[0].props.items, [app])
          assert.equal(apps[0].props.layout, layout)
          const container = childrenOfType(view, "div").find((element) =>
            element.props.className?.includes("extension-container")
          )
          assert.equal(container.props.children.at(-1), apps[0])
        }
        assert.deepEqual(h.props.options.groups, groupsBefore)
        assert.equal(childrenOfType(view, "Header")[0].props.totalCount, 1)

        // A user selecting another group must not hide the presentation-only App section.
        childrenOfType(view, "Header")[0].props.onGroupChanged({ id: "other", extensions: [] })
        assert.equal(childrenOfType(h.render(), "AppList").length, isShowApp ? 1 : 0)
      }
    })
  }
}
