import assert from "node:assert/strict"
import { test } from "node:test"

import { theme as antTheme } from "antd"
import buttonToken from "antd/lib/button/style/token.js"
import paginationToken from "antd/lib/pagination/style/index.js"
import sliderToken from "antd/lib/slider/style/index.js"

import * as themes from "../src/styles/themes.js"

const flush = () => new Promise((resolve) => setImmediate(resolve))

function harness(readMode = async () => undefined) {
  const mediaQuery = new EventTarget()
  mediaQuery.matches = false
  const listeners = new Set()
  const storageChanges = {
    addListener: (listener) => listeners.add(listener),
    removeListener: (listener) => listeners.delete(listener)
  }
  const states = []
  const observer = themes.observeThemePreference({
    readMode,
    mediaQuery,
    storageChanges,
    onChange: (state) => states.push(state)
  })
  return {
    ...observer,
    states,
    system(dark) {
      mediaQuery.matches = dark
      mediaQuery.dispatchEvent(new Event("change"))
    },
    storage(changes, area = "sync") {
      for (const listener of listeners) listener(changes, area)
    }
  }
}

// Missing listeners, treating an explicit mode as system, or a stale async read
// overwriting a user's choice must change the theme observed by these consumers.
test("theme selection applies immediately and only system mode follows OS changes", async () => {
  const view = harness()
  await flush()
  assert.deepEqual(view.states.at(-1), { mode: "system", isDarkMode: false })
  view.system(true)
  assert.deepEqual(view.states.at(-1), { mode: "system", isDarkMode: true })
  view.setMode("light")
  assert.deepEqual(view.states.at(-1), { mode: "light", isDarkMode: false })
  view.system(false)
  view.system(true)
  assert.deepEqual(view.states.at(-1), { mode: "light", isDarkMode: false })
  view.setMode("dark")
  assert.deepEqual(view.states.at(-1), { mode: "dark", isDarkMode: true })
  view.setMode("system")
  assert.deepEqual(view.states.at(-1), { mode: "system", isDarkMode: true })
  view.dispose()
})

test("saved, imported and cleared settings refresh the theme without unrelated storage reads", async () => {
  let mode = "light"
  const view = harness(async () => mode)
  await flush()
  mode = "dark"
  view.storage({ activeSceneIds: {} }, "local")
  view.storage({ "LS__groups.0": {} })
  await flush()
  assert.deepEqual(view.states.at(-1), { mode: "light", isDarkMode: false })
  view.storage({ "LS__setting.0": { newValue: "compressed settings" } })
  await flush()
  assert.deepEqual(view.states.at(-1), { mode: "dark", isDarkMode: true })
  mode = undefined
  view.storage({ "LS__setting.meta": { oldValue: {} } })
  await flush()
  assert.deepEqual(view.states.at(-1), { mode: "system", isDarkMode: false })
  view.dispose()
})

test("a delayed initial read cannot overwrite an immediate theme selection", async () => {
  let resolveRead
  const view = harness(() => new Promise((resolve) => (resolveRead = resolve)))
  view.setMode("dark")
  resolveRead("light")
  await flush()
  assert.deepEqual(view.states, [{ mode: "dark", isDarkMode: true }])
  view.dispose()
})

test("the latest settings read wins and disposed pages stop receiving theme updates", async () => {
  const reads = []
  const view = harness(() => new Promise((resolve) => reads.push(resolve)))
  view.storage({ "LS__setting.0": {} })
  reads[1]("dark")
  await flush()
  reads[0]("light")
  await flush()
  assert.deepEqual(view.states, [{ mode: "dark", isDarkMode: true }])
  view.storage({ "LS__setting.0": {} })
  view.dispose()
  reads[2]("system")
  view.system(true)
  view.storage({ "LS__setting.0": {} })
  await flush()
  assert.equal(reads.length, 3)
  assert.equal(view.states.length, 1)
})

test("an unavailable stored preference still allows system and manual themes", async (t) => {
  t.mock.method(console, "error", () => {})
  const view = harness(async () => {
    throw new Error("Storage unavailable")
  })
  await flush()
  assert.deepEqual(view.states.at(-1), { mode: "system", isDarkMode: false })
  view.system(true)
  assert.deepEqual(view.states.at(-1), { mode: "system", isDarkMode: true })
  view.setMode("light")
  assert.deepEqual(view.states.at(-1), { mode: "light", isDarkMode: false })
  view.dispose()
})

function luminance(hex) {
  const channels = hex
    .replace("#", "")
    .match(/../g)
    .map((value) => parseInt(value, 16) / 255)
  return channels
    .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
    .reduce((sum, value, index) => sum + value * [0.2126, 0.7152, 0.0722][index], 0)
}

function contrast(a, b) {
  const values = [luminance(a), luminance(b)].sort((a, b) => b - a)
  return (values[0] + 0.05) / (values[1] + 0.05)
}

test("both themes keep button labels, links and disabled extension names readable", () => {
  for (const palette of [themes.lightTheme, themes.darkTheme]) {
    const tokens = themes.getAntThemeTokens(palette)
    for (const bg of [tokens.colorPrimary, tokens.colorPrimaryHover, tokens.colorPrimaryActive]) {
      assert.ok(
        contrast("#ffffff", bg ?? tokens.colorPrimary) >= 4.5,
        "primary button white labels"
      )
    }
    assert.ok(contrast(palette.disable_text, palette.bg) >= 4.5, "disabled extension names")
    assert.ok(contrast(palette.nav_link, palette.primary_soft) >= 4.5, "selected navigation text")
    assert.ok(contrast(palette.input_border, palette.surface) >= 3, "input boundaries")
  }
})

test("Ant text states, slider handles and keyboard focus remain distinguishable", () => {
  for (const palette of [themes.lightTheme, themes.darkTheme]) {
    const tokens = antTheme.getDesignToken({
      algorithm: palette.isDark ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm,
      token: themes.getAntThemeTokens(palette)
    })
    const components = themes.getAntThemeComponents?.(palette) ?? {}
    const button = { ...buttonToken.prepareComponentToken(tokens), ...components.Button }
    for (const color of [button.defaultHoverColor, button.defaultActiveColor]) {
      assert.ok(contrast(color, palette.surface) >= 4.5, "outlined button text states")
    }
    const pagination = {
      ...paginationToken.prepareComponentToken(tokens),
      ...components.Pagination
    }
    assert.ok(contrast(pagination.itemActiveColor, pagination.itemActiveBg) >= 4.5, "selected page")
    assert.ok(
      contrast(pagination.itemActiveColorHover, pagination.itemActiveBg) >= 4.5,
      "selected page hover"
    )
    assert.ok(
      contrast(
        components.Dropdown?.colorPrimary ?? tokens.colorPrimary,
        tokens.controlItemBgActive
      ) >= 4.5,
      "selected dropdown text"
    )
    const slider = { ...sliderToken.prepareComponentToken(tokens), ...components.Slider }
    assert.ok(contrast(slider.handleColor, palette.surface) >= 3, "slider handle boundary")
    assert.ok(contrast(slider.handleActiveColor, palette.surface) >= 3, "active slider handle")
    assert.ok(contrast(tokens.colorPrimaryBorder, palette.surface) >= 3, "keyboard focus outline")
  }
})
