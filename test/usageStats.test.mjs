import assert from "node:assert/strict"
import test from "node:test"

import {
  buildUsageStats,
  collectEnableTimestamps,
  daysBetween,
  NEVER_USED_DAYS_THRESHOLD,
  UNUSED_DAYS_THRESHOLD
} from "../src/pages/Options/history/usageStats.js"

const ONE_DAY_MS = 24 * 60 * 60 * 1000
const NOW = 1000 * ONE_DAY_MS

test("daysBetween floors to whole days", () => {
  assert.equal(daysBetween(0, NOW), 1000)
  assert.equal(daysBetween(NOW - ONE_DAY_MS * 1.5, NOW), 1)
  assert.equal(daysBetween(undefined, NOW), null)
})

test("collectEnableTimestamps keeps only enabled events", () => {
  const records = [
    { timestamp: 10, event: "enabled", extensionId: "a" },
    { timestamp: 20, event: "disabled", extensionId: "a" },
    { timestamp: 30, event: "enabled", extensionId: "a" },
    { timestamp: 40, event: "enabled", extensionId: "b" }
  ]
  const map = collectEnableTimestamps(records)
  assert.deepEqual(map.get("a"), [10, 30])
  assert.deepEqual(map.get("b"), [40])
})

test("buildUsageStats computes per-extension counters", () => {
  const records = [
    { timestamp: NOW - 10 * ONE_DAY_MS, event: "install", extensionId: "a" },
    { timestamp: NOW - 5 * ONE_DAY_MS, event: "enabled", extensionId: "a" },
    { timestamp: NOW - 9 * ONE_DAY_MS, event: "enabled", extensionId: "a" },
    { timestamp: NOW - 20 * ONE_DAY_MS, event: "install", extensionId: "b" }
  ]
  const extensions = [
    { id: "a", name: "Alpha", enabled: true },
    { id: "b", name: "Beta", enabled: true }
  ]

  const { extStats } = buildUsageStats(records, extensions, NOW)

  const a = extStats.find((s) => s.id === "a")
  assert.equal(a.enableCount, 2)
  assert.equal(a.lastEnableDaysAgo, 5)
  assert.equal(a.installDaysAgo, 10)

  const b = extStats.find((s) => s.id === "b")
  assert.equal(b.enableCount, 0)
  assert.equal(b.lastEnableDaysAgo, null)
  assert.equal(b.installDaysAgo, 20)
})

test("buildUsageStats marks long-unused enabled extension as disable candidate", () => {
  const records = [
    {
      timestamp: NOW - (UNUSED_DAYS_THRESHOLD + 1) * ONE_DAY_MS,
      event: "enabled",
      extensionId: "a"
    }
  ]
  const extensions = [{ id: "a", name: "Alpha", enabled: true }]

  const { candidates } = buildUsageStats(records, extensions, NOW)

  assert.equal(candidates.length, 1)
  assert.equal(candidates[0].type, "disable")
  assert.equal(candidates[0].id, "a")
  assert.equal(candidates[0].days, UNUSED_DAYS_THRESHOLD + 1)
})

test("buildUsageStats marks never-used old install as review candidate", () => {
  const records = [
    {
      timestamp: NOW - (NEVER_USED_DAYS_THRESHOLD + 5) * ONE_DAY_MS,
      event: "install",
      extensionId: "a"
    }
  ]
  const extensions = [{ id: "a", name: "Alpha", enabled: true }]

  const { candidates } = buildUsageStats(records, extensions, NOW)

  assert.equal(candidates.length, 1)
  assert.equal(candidates[0].type, "review")
})

test("buildUsageStats ignores recently used or disabled extensions", () => {
  const records = [
    { timestamp: NOW - 3 * ONE_DAY_MS, event: "enabled", extensionId: "recent" },
    { timestamp: NOW - 300 * ONE_DAY_MS, event: "enabled", extensionId: "turned-off" }
  ]
  const extensions = [
    { id: "recent", name: "R", enabled: true },
    { id: "turned-off", name: "T", enabled: false }
  ]

  const { candidates } = buildUsageStats(records, extensions, NOW)
  assert.equal(candidates.length, 0)
})

test("buildUsageStats sorts disable candidates by unused days desc", () => {
  const records = [
    { timestamp: NOW - 100 * ONE_DAY_MS, event: "enabled", extensionId: "x" },
    { timestamp: NOW - 200 * ONE_DAY_MS, event: "enabled", extensionId: "y" }
  ]
  const extensions = [
    { id: "x", name: "X", enabled: true },
    { id: "y", name: "Y", enabled: true }
  ]

  const { candidates } = buildUsageStats(records, extensions, NOW)
  assert.deepEqual(
    candidates.map((c) => c.id),
    ["y", "x"]
  )
})
