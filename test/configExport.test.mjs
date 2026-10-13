import assert from "node:assert/strict"
import test from "node:test"

import { createSourceLoader } from "./helpers/loadSource.mjs"

async function exportJson(config, errors = []) {
  let downloaded
  const load = createSourceLoader(
    {
      ".../storage/sync": { options: { getAll: async () => config } },
      ".../utils/utils": {
        downloadFile: (blob) => {
          downloaded = blob
        },
        formatDate: () => "2026-10-13"
      },
      "../../Background/rule/RuleConverter": { default: (rule) => rule }
    },
    { console: { error: (...args) => errors.push(args) } }
  )
  await load("src/pages/Options/settings/ConfigFileBackup.ts").exportConfig()
  return downloaded.text()
}

test("export stabilizes object keys and extension collections without changing ordered arrays", async () => {
  const config = {
    setting: { z: true, a: false },
    groups: [
      { id: "z", name: "First", extensions: ["bbb", "aaa"] },
      { id: "a", extensions: [] }
    ],
    scenes: [{ id: "z" }, { id: "a" }],
    ruleConfig: [
      {
        id: "z",
        target: { groups: ["z", "a"], extensions: ["bbb", "aaa"] },
        match: { triggers: [{ config: { matchUrl: ["z", "a"] } }, { config: null }] }
      },
      { id: "a", target: { targetExtensions: ["bbb", "aaa"] } }
    ],
    management: {
      extensions: [
        { extId: "bbb", update_time: 123, remark: "B" },
        { extId: "aaa", alias: "A" }
      ]
    }
  }
  const before = structuredClone(config)
  const json = await exportJson(config)
  const result = JSON.parse(json)
  assert.deepEqual(Object.keys(result), ["setting", "groups", "scenes", "ruleConfig", "management"])
  assert.deepEqual(Object.keys(result.setting), ["a", "z"])
  assert.deepEqual(Object.keys(result.groups[0]), ["extensions", "id", "name"])
  assert.deepEqual(result.groups[0].extensions, ["aaa", "bbb"])
  assert.deepEqual(result.ruleConfig[0].target.extensions, ["aaa", "bbb"])
  assert.deepEqual(result.ruleConfig[1].target.targetExtensions, ["aaa", "bbb"])
  assert.deepEqual(
    result.management.extensions.map((item) => item.extId),
    ["aaa", "bbb"]
  )
  assert.equal(result.management.extensions[1].update_time, 123)
  for (const key of ["groups", "scenes", "ruleConfig"]) {
    assert.deepEqual(
      result[key].map((item) => item.id),
      ["z", "a"]
    )
  }
  assert.deepEqual(result.ruleConfig[0].target.groups, ["z", "a"])
  assert.deepEqual(result.ruleConfig[0].match, before.ruleConfig[0].match)
  assert.deepEqual(config, before)

  const reordered = structuredClone(config)
  reordered.setting = { a: false, z: true }
  reordered.groups[0] = { extensions: ["aaa", "bbb"], name: "First", id: "z" }
  reordered.ruleConfig[0].target.extensions.reverse()
  reordered.ruleConfig[1].target.targetExtensions.reverse()
  reordered.management.extensions.reverse()
  assert.equal(await exportJson(reordered), json)
})

test("export retains empty collections and optional rule fields", async () => {
  const config = {
    setting: {},
    groups: [],
    scenes: [],
    ruleConfig: [{ id: "empty" }],
    management: { extensions: [] }
  }
  assert.deepEqual(JSON.parse(await exportJson(config)), config)
})

test("sorting failures log an error and export the complete original JSON", async () => {
  const config = {
    setting: { z: true, a: false },
    groups: [{ id: "z", extensions: ["bbb", "aaa"] }],
    scenes: [],
    ruleConfig: [],
    management: { extensions: [{ extId: "bbb", remark: "Keep me" }, null, { extId: "aaa" }] }
  }
  const original = JSON.stringify(config, null, 2)
  const errors = []
  assert.equal(await exportJson(config, errors), original)
  assert.equal(JSON.stringify(config, null, 2), original)
  assert.equal(errors.length, 1)
  assert.match(errors[0][0], /sort|排序/i)
  assert.ok(errors[0][1] instanceof Error)
})

test("sorting preserves the original JSON representation of serializable values", async () => {
  const config = {
    setting: { timestamp: new Date("2026-10-13T00:00:00Z") },
    groups: [],
    scenes: [],
    ruleConfig: [],
    management: { extensions: [] }
  }
  assert.deepEqual(JSON.parse(await exportJson(config)), JSON.parse(JSON.stringify(config)))
})

test("unserializable source data logs the error rather than producing an incomplete backup", async () => {
  const config = { setting: {} }
  config.setting.circular = config
  const errors = []
  await assert.rejects(exportJson(config, errors), /circular/i)
  assert.equal(errors.length, 1)
  assert.match(errors[0][0], /serialize/i)
  assert.ok(errors[0][1] instanceof Error)
})
