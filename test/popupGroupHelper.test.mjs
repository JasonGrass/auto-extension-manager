import assert from "node:assert/strict"
import test from "node:test"

import { buildNoGroup, NO_GROUP_ID } from "../src/pages/Popup/utils/popupGroupHelper.js"

test("the no-group filter keeps only extensions absent from every group", () => {
  const extensions = [{ id: "fixed" }, { id: "work" }, { id: "ungrouped" }]
  const groups = [
    { id: "fixed", extensions: ["fixed"] },
    { id: "work", extensions: ["work"] },
    { id: "empty" }
  ]

  assert.deepEqual(buildNoGroup(extensions, groups, "未分组"), {
    id: NO_GROUP_ID,
    name: "未分组",
    extensions: ["ungrouped"]
  })
})
