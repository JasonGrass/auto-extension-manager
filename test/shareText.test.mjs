import assert from "node:assert/strict"
import { test } from "node:test"
import LZString from "lz-string"
import { parse } from "../src/pages/Options/management/import/helper/importParser.js"
import { buildShareText } from "../src/pages/Options/management/share/TextFormat/buildShareText.js"
import { createSourceLoader } from "./helpers/loadSource.mjs"

const wrap = (content) => `--------BEGIN--------\n${content}\n--------END--------`

test("share text preserves all 16 independent alias/remark data and selection combinations", () => {
  for (const alias of ["", "Alias"])
    for (const remark of ["", "Remark"]) {
      for (const [range, wantAlias, wantRemark] of [
        [[], "", ""],
        [["alias"], alias, ""],
        [["remark"], "", remark],
        [["alias", "remark"], alias, remark]
      ]) {
        const [content, count] = buildShareText(
          [
            { id: "A", name: "Name", channel: "Chrome", alias, remark },
            { id: "excluded", name: "Other" }
          ],
          range,
          ["A"]
        )
        assert.equal(count, 1)
        assert.deepEqual(parse(wrap(content)), [
          { id: "A", name: "Name", channel: "Chrome", alias: wantAlias, remark: wantRemark }
        ])
      }
    }
})

test("legacy three, four and five field text remains compatible without guessing ambiguous data", () => {
  for (const [raw, alias, remark] of [
    ["##<#A#><#Name#><#Chrome#>", undefined, undefined],
    ["##<#A#><#Name#><#Chrome#><#Note#>", "Note", undefined],
    ["##<#A#><#Name#><#Chrome#><#Alias#><#Remark#>", "Alias", "Remark"]
  ]) {
    assert.deepEqual(parse(wrap(LZString.compressToBase64(raw))), [
      { id: "A", name: "Name", channel: "Chrome", alias, remark }
    ])
  }
})

test("installation import applies only selected nonempty fields", async () => {
  for (const [isAlias, isRemark, want] of [
    [false, false, []],
    [true, false, [{ alias: "Alias" }]],
    [false, true, [{ remark: "Remark" }]],
    [true, true, [{ alias: "Alias" }, { remark: "Remark" }]]
  ]) {
    const writes = []
    let listener
    const load = createSourceLoader(
      {
        react: { useEffect: (fn) => fn() },
        ".../storage/sync": {
          management: { updateExtension: async (_id, info) => writes.push(info) }
        }
      },
      {
        chrome: {
          management: {
            onInstalled: {
              addListener: (fn) => {
                listener = fn
              }
            }
          }
        }
      }
    )
    load(
      "src/pages/Options/management/import/helper/useExtensionInstallListener.js"
    ).useExtensionInstallListener(
      [
        { id: "A", alias: "Alias", remark: "Remark" },
        { id: "B", alias: "", remark: "" }
      ],
      isAlias,
      isRemark
    )
    await listener({ id: "A" })
    await listener({ id: "B" })
    await listener({ id: "not-selected" })
    assert.deepEqual(writes, want)
  }
})
