import assert from "node:assert/strict"
import test from "node:test"

import {
  normalizeActiveSceneIds,
  resolveStoredActiveSceneIds,
  updateActiveSceneIds
} from "../src/storage/local/activeSceneState.ts"

test("normalizeActiveSceneIds removes malformed and duplicate persisted values", () => {
  assert.deepEqual(normalizeActiveSceneIds(["work", "", "work", null, "dev"]), ["work", "dev"])
})

test("resolveStoredActiveSceneIds migrates the legacy single-scene value", () => {
  assert.deepEqual(resolveStoredActiveSceneIds(undefined, "legacy"), ["legacy"])

  // An explicit empty collection must win over legacy data after a user cancels all scenes.
  assert.deepEqual(resolveStoredActiveSceneIds([], "legacy"), [])
})

test("updateActiveSceneIds supports independent activation and deactivation", () => {
  assert.deepEqual(updateActiveSceneIds(["work"], "dev", true, false), ["work", "dev"])
  assert.deepEqual(updateActiveSceneIds(["work", "dev"], "work", false, false), ["dev"])
})

test("updateActiveSceneIds replaces the collection only on exclusive activation", () => {
  assert.deepEqual(updateActiveSceneIds(["work", "dev"], "meeting", true, true), ["meeting"])

  // Deactivation remains local even while the exclusive preference is enabled.
  assert.deepEqual(updateActiveSceneIds(["work", "dev"], "work", false, true), ["dev"])
})
