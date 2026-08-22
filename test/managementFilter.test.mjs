import assert from "node:assert/strict"
import test from "node:test"

import {
  ALL_GROUPS_FILTER,
  buildGroupFilterOptions,
  filterRecordsByGroup
} from "../src/pages/Options/management/managementFilter.js"

const records = [
  { id: "extension-a", name: "A" },
  { id: "extension-b", name: "B" },
  { id: "extension-c", name: "C" }
]

const groups = [{ id: "work", extensions: ["extension-a", "extension-c"] }, { id: "empty" }]

test("group filter labels fall back to an existing locale message", () => {
  const messages = {
    group_select_all: "全部",
    group_fixed_name: "固定分组",
    group_hidden_name: "隐藏分组"
  }
  const getMessage = (key) => messages[key] ?? ""

  assert.deepEqual(
    buildGroupFilterOptions(
      [
        { id: "fixed", name: "__fixed_group__" },
        { id: "hidden", name: "__hidden_group__" },
        { id: "work", name: "工作" }
      ],
      getMessage
    ),
    [
      { value: ALL_GROUPS_FILTER, label: "全部" },
      { value: "fixed", label: "固定分组" },
      { value: "hidden", label: "隐藏分组" },
      { value: "work", label: "工作" }
    ]
  )
})

test("the all-groups filter preserves every management record", () => {
  assert.equal(filterRecordsByGroup(records, ALL_GROUPS_FILTER, groups), records)
})

test("a group filter only keeps records whose IDs belong to that group", () => {
  assert.deepEqual(filterRecordsByGroup(records, "work", groups), [records[0], records[2]])
})

test("empty and unavailable groups produce an empty result", () => {
  assert.deepEqual(filterRecordsByGroup(records, "empty", groups), [])
  assert.deepEqual(filterRecordsByGroup(records, "deleted", groups), [])
})
