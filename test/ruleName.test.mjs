import assert from "node:assert/strict"
import { test } from "node:test"
import ConvertRuleToV2 from "../src/pages/Background/rule/RuleConverter.ts"
import { createSourceLoader } from "./helpers/loadSource.mjs"

const legacy = {
  id: "legacy",
  enable: true,
  match: { matchMode: "host", matchMethod: "wildcard", matchHost: ["example.com"] },
  target: { targetType: "single", targetExtensions: ["extension-a"] },
  action: { actionType: "openWhenMatched" }
}

test("old rules default to an empty name without changing matching or actions", () => {
  const converted = ConvertRuleToV2(legacy)
  assert.equal(converted.name, "")
  assert.deepEqual(converted.match.triggers, [
    { trigger: "urlTrigger", config: { matchMethod: "wildcard", matchUrl: ["example.com"] } }
  ])
  assert.equal(converted.action.actionType, "openWhenMatched")

  const { name: _name, ...unnamedV2 } = converted
  assert.deepEqual(ConvertRuleToV2(unnamedV2), converted)
  assert.equal(Object.hasOwn(unnamedV2, "name"), false)
  for (const name of [null, 123, { text: "invalid" }]) {
    assert.equal(ConvertRuleToV2({ ...unnamedV2, name }).name, "")
  }
})

test("rule names survive save, reload, duplication and compressed backup restore", async () => {
  let saved = { ruleConfig: [] }
  const load = createSourceLoader({
    "./options-storage": {
      SyncOptionsStorage: {
        getAll: async () => structuredClone(saved),
        set: async (options) => {
          saved = structuredClone(options)
        }
      }
    }
  })
  const rules = load("src/storage/sync/RuleConfigOptions.js").default
  const compression = load("src/storage/utils/ConfigCompress.js").default
  await rules.addOne({ ...ConvertRuleToV2(legacy), name: "工作 & Research" })
  const [original] = await rules.get()
  assert.equal(original.name, "工作 & Research")

  await rules.duplicate(original)
  const copies = await rules.get()
  assert.equal(copies.length, 2)
  assert.notEqual(copies[0].id, original.id)
  assert.equal(copies[0].name, "工作 & Research")

  await rules.update({ id: original.id, name: "" })
  saved = JSON.parse(JSON.stringify(compression.decompress(compression.compress(saved))))
  const restored = await rules.get()
  assert.equal(restored.find((rule) => rule.id === original.id).name, "")
  assert.equal(restored.find((rule) => rule.id !== original.id).name, "工作 & Research")
  assert.equal(restored.find((rule) => rule.id === original.id).enable, true)
})
