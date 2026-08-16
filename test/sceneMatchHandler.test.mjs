import assert from "node:assert/strict"
import test from "node:test"

import checkCurrentSceneMatch from "../src/pages/Background/rule/handlers/match/sceneMatchHandler.ts"

const buildRule = (config) => ({
  version: 2,
  enable: true,
  match: {
    relationship: "and",
    triggers: [{ trigger: "sceneTrigger", config }]
  }
})

test("scene trigger matches when any configured and active scene intersects", async () => {
  const rule = buildRule({ sceneIds: ["work", "meeting"] })

  assert.equal(await checkCurrentSceneMatch(["dev", "meeting"], rule), true)
  assert.equal(await checkCurrentSceneMatch(["dev", "travel"], rule), false)
})

test("scene trigger remains compatible with legacy sceneId rules", async () => {
  const rule = buildRule({ sceneId: "legacy" })

  assert.equal(await checkCurrentSceneMatch(["work", "legacy"], rule), true)
})

test("scene trigger distinguishes missing triggers from no active scenes", async () => {
  assert.equal(await checkCurrentSceneMatch([], buildRule({ sceneIds: ["work"] })), false)
  assert.equal(
    await checkCurrentSceneMatch(["work"], {
      version: 2,
      enable: true,
      match: { relationship: "and", triggers: [] }
    }),
    undefined
  )
})
