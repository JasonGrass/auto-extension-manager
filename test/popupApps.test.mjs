import assert from "node:assert/strict"
import test from "node:test"
import React from "react"

import { createSourceLoader } from "./helpers/loadSource.mjs"

function elements(tree) {
  if (!tree?.props) return []
  return [tree, ...[tree.props.children].flat(Infinity).flatMap(elements)]
}

function appView() {
  const launches = []
  const messages = []
  let launchError
  const load = createSourceLoader(
    {
      react: { ...React, memo: (component) => component },
      antd: {
        message: {
          useMessage: () => [
            {
              warning: (text) => messages.push(text),
              info: (text) => messages.push(text)
            },
            null
          ]
        }
      },
      "webext-polyfill-kinda": {
        management: {
          async launchApp(id) {
            if (launchError) throw launchError
            launches.push(id)
          }
        }
      },
      ".../utils/utils": {
        getLang: (key) => (key === "popup_app_group_name" ? "App" : key)
      },
      "./AppListStyle.js": { AppListStyle: "section" },
      "./common/ExtensionIcon": "img"
    },
    { console: { error() {} } }
  )
  const AppList = load("src/pages/Popup/Components/AppList.jsx").default
  return {
    render: (items, layout) => AppList({ items, layout }),
    launches,
    messages,
    failLaunch: () => {
      launchError = new Error("launchApp is deprecated")
    }
  }
}

for (const layout of ["list", "grid"]) {
  test(`${layout} apps form a named section and preserve launch behavior`, async () => {
    const view = appView()
    const enabled = { id: "enabled", name: "Enabled", shortName: "Enabled", enabled: true }
    const disabled = { id: "disabled", name: "Disabled", shortName: "Disabled", enabled: false }
    const tree = view.render([enabled, disabled], layout)
    assert.equal(tree.props["aria-label"], "App")
    assert.ok(
      elements(tree).some((element) => element.type === "h2" && element.props.children === "App")
    )
    assert.ok(tree.props.className.includes(`app-${layout}`))
    const icons = elements(tree).filter((element) => element.type === "img")
    await icons[0].props.onClick({})
    assert.deepEqual(view.launches, ["enabled"])
    await icons[1].props.onClick({})
    assert.deepEqual(view.launches, ["enabled"])
    assert.ok(view.messages.some((message) => message.includes("app_not_enable")))

    view.failLaunch()
    await icons[0].props.onClick({})
    assert.ok(view.messages.some((message) => message.includes("chrome://apps")))
    assert.equal(view.render([], layout), null)
  })
}
