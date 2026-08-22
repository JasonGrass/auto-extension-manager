import assert from "node:assert/strict"
import test from "node:test"

import {
  EXTENSION_ICON_CACHE_VERSION,
  buildTextIconDataUrl,
  getManifestIconCandidates,
  shouldRefreshExtensionIcon
} from "../src/utils/extensionIconPolicy.ts"

test("old icon caches are refreshed once after the cache format upgrade", () => {
  assert.equal(
    shouldRefreshExtensionIcon({
      icon: "data:image/png;base64,old",
      version: "1.0"
    }),
    true
  )

  assert.equal(
    shouldRefreshExtensionIcon({
      icon: "data:image/png;base64,current",
      iconSource: "manifest",
      iconCacheVersion: EXTENSION_ICON_CACHE_VERSION,
      version: "1.0"
    }),
    false
  )

  assert.equal(
    shouldRefreshExtensionIcon({
      icon: "data:image/png;base64,old-favicon",
      iconSource: "favicon",
      iconCacheVersion: 2,
      version: "1.0"
    }),
    true
  )
})

test("force and installed extension version changes refresh current caches", () => {
  const record = {
    icon: "data:image/png;base64,current",
    iconSource: "manifest",
    iconCacheVersion: EXTENSION_ICON_CACHE_VERSION,
    version: "1.0"
  }

  assert.equal(shouldRefreshExtensionIcon(record, true, "1.0"), true)
  assert.equal(shouldRefreshExtensionIcon(record, false, "2.0"), true)
  assert.equal(shouldRefreshExtensionIcon(record, false, "1.0"), false)
  assert.equal(shouldRefreshExtensionIcon({ ...record, state: "uninstall" }, false, "1.0"), true)
})

test("manifest icon candidates prefer the smallest sufficient size then smaller fallbacks", () => {
  const extension = {
    icons: [
      { size: 16, url: "16.png" },
      { size: 256, url: "256.png" },
      { size: 48, url: "48.png" },
      { size: 128, url: "128.png" }
    ]
  }

  assert.deepEqual(getManifestIconCandidates(extension, 64), [
    "128.png",
    "256.png",
    "48.png",
    "16.png"
  ])
  assert.deepEqual(getManifestIconCandidates({ name: "action-only" }, 128), [])
})

test("text fallback is a stable SVG data URL and supports unicode names", () => {
  const first = buildTextIconDataUrl("  标签管理器")
  const second = buildTextIconDataUrl("  标签管理器")

  assert.equal(first, second)
  assert.match(first, /^data:image\/svg\+xml;charset=utf-8,/)
  assert.match(decodeURIComponent(first), />标<\/text>/)
  assert.equal(buildTextIconDataUrl(""), "")
})
