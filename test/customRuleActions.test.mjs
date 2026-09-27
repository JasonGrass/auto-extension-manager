import assert from "node:assert/strict"
import { test } from "node:test"
import { rule, ruleHarness } from "./helpers/ruleHarness.mjs"

const custom = (enable, disable, enableMode = "", disableMode = "") => ({
  actionType: "custom",
  custom: {
    timeWhenEnable: enable,
    timeWhenDisable: disable,
    urlMatchWhenEnable: enableMode,
    urlMatchWhenDisable: disableMode
  }
})

test("non-URL custom actions honor match, notMatch and none for scene, OS and time", async () => {
  const h = ruleHarness()
  const process = h.load("src/pages/Background/rule/processor.ts").default
  const match = h.load("src/pages/Background/rule/handlers/matchHandler.ts").default
  const ctx = { selfId: "self", tab: h.tab, tabs: [h.tab], EM: h.EM }
  const triggers = [
    [
      { trigger: "sceneTrigger", config: { sceneIds: ["S"] } },
      { trigger: "sceneTrigger", config: { sceneIds: ["different"] } }
    ],
    [
      { trigger: "osTrigger", config: { os: ["win"] } },
      { trigger: "osTrigger", config: { os: ["linux"] } }
    ],
    [
      { trigger: "periodTrigger", config: { periods: [{ start: "00:00", end: "23:59" }] } },
      { trigger: "periodTrigger", config: { periods: [] } }
    ]
  ]
  for (const pair of triggers) {
    for (const relationship of ["and", "or"]) {
      for (const [trigger, timing] of [
        [pair[0], "match"],
        [pair[1], "notMatch"]
      ]) {
        for (const enable of [true, false]) {
          const config = rule(enable ? custom(timing, "none") : custom("none", timing))
          config.match = { relationship, triggers: [trigger] }
          const result = await match(["S"], config, ctx)
          assert.equal(
            result.isAnyMatch,
            result.isCurrentMatch,
            "absent URL is not an extra false condition"
          )
          h.enabled.set("A", !enable)
          h.calls.length = 0
          await process({ activeSceneIds: ["S"], rules: [config], groups: [], ctx })
          await h.runTimers()
          assert.deepEqual(h.calls, [["A", enable]], `${trigger.trigger} ${relationship} ${timing}`)
        }
      }
    }
  }
  h.calls.length = 0
  await process({ activeSceneIds: ["S"], rules: [rule(custom("none", "none"))], groups: [], ctx })
  assert.deepEqual(h.calls, [])
})

test("removing a URL condition ignores residual URL modes", async () => {
  const h = ruleHarness()
  const process = h.load("src/pages/Background/rule/processor.ts").default
  const ctx = { selfId: "self", tab: null, tabs: [], EM: h.EM }
  await process({
    activeSceneIds: ["S"],
    rules: [rule(custom("match", "notMatch", "anyMatch", "allNotMatch"))],
    groups: [],
    ctx
  })
  await h.runTimers()
  assert.deepEqual(h.calls, [["A", true]])
})

test("URL modes retain current/any matching and conditional reload behavior", async () => {
  const h = ruleHarness()
  const process = h.load("src/pages/Background/rule/processor.ts").default
  const matchingTab = { id: 2, url: "https://matched.example/" }
  const ctx = { selfId: "self", tab: h.tab, tabs: [h.tab, matchingTab], EM: h.EM }
  for (const [mode, timing, tabs, expected] of [
    ["currentMatch", "match", ctx.tabs, []],
    ["anyMatch", "match", ctx.tabs, [["A", true]]],
    [
      "currentNotMatch",
      "notMatch",
      ctx.tabs,
      [
        ["A", true],
        ["reload", 1]
      ]
    ],
    ["allNotMatch", "notMatch", ctx.tabs, []],
    [
      "allNotMatch",
      "notMatch",
      [h.tab],
      [
        ["A", true],
        ["reload", 1]
      ]
    ]
  ]) {
    h.calls.length = 0
    h.enabled.clear()
    const config = rule({ ...custom(timing, "none", mode), reloadAfterEnable: true })
    config.match.triggers = [
      { trigger: "urlTrigger", config: { matchMethod: "wildcard", matchUrl: ["matched.example"] } }
    ]
    await process({ activeSceneIds: [], rules: [config], groups: [], ctx: { ...ctx, tabs } })
    assert.deepEqual(h.calls, expected, mode)
  }
})

test("automatic actions retain priority, self exclusion, page protection and disable cancellation", async () => {
  const h = ruleHarness()
  const process = h.load("src/pages/Background/rule/processor.ts").default
  const ctx = { selfId: "self", tab: h.tab, tabs: [h.tab], EM: h.EM }
  const lowPriority = rule(custom("none", "notMatch"), { extensions: ["A"] })
  lowPriority.match.triggers = [{ trigger: "sceneTrigger", config: { sceneIds: ["other"] } }]
  const highPriority = rule(custom("match", "none"), { extensions: ["self", "A"] })
  await process({ activeSceneIds: ["S"], rules: [lowPriority, highPriority], groups: [], ctx })
  await h.runTimers()
  assert.deepEqual(h.calls, [["A", true]])
  h.calls.length = 0
  const close = rule(custom("none", "match"))
  await process({
    activeSceneIds: ["S"],
    rules: [close],
    groups: [],
    ctx: { ...ctx, tabs: [{ url: "chrome-extension://A/options.html" }] }
  })
  await h.runTimers()
  assert.deepEqual(h.calls, [])
  await process({ activeSceneIds: ["S"], rules: [close], groups: [], ctx })
  await process({ activeSceneIds: ["S"], rules: [highPriority], groups: [], ctx })
  await h.runTimers()
  assert.deepEqual(h.calls, [])
})
