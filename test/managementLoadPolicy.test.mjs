import assert from "node:assert/strict"
import test from "node:test"

import {
  ManagementLoadError,
  collectExtensionEnhancements,
  loadManagementCore,
  mergeExtensionsById
} from "../src/pages/Options/management/managementLoadPolicy.ts"

test("core management data does not depend on optional cache enhancements", async () => {
  const extensions = [
    { id: "extension-a", type: "extension" },
    { id: "app-a", type: "packaged_app" }
  ]
  const options = { management: { extensions: [] } }

  const result = await loadManagementCore({
    getExtensions: async () => extensions,
    getOptions: async () => options,
    filterExtensions: (items) => items.filter((item) => item.type === "extension")
  })

  assert.deepEqual(result, { extensions: [extensions[0]], options })
})

test("core management data reports an empty extension result", async () => {
  await assert.rejects(
    loadManagementCore({
      getExtensions: async () => [],
      getOptions: async () => ({ management: { extensions: [] } }),
      filterExtensions: (items) => items
    }),
    (error) => error instanceof ManagementLoadError && error.code === "NO_EXTENSION_DATA"
  )
})

test("cache enhancement failures preserve raw extensions and isolate each channel read", async () => {
  const extensions = [
    { id: "extension-a", name: "A" },
    { id: "extension-b", name: "B" }
  ]

  const result = await collectExtensionEnhancements(extensions, {
    loadIcons: async () => {
      throw new Error("IndexedDB icon read failed")
    },
    loadChannel: async (extensionId) => {
      if (extensionId === "extension-b") {
        throw new Error("IndexedDB channel read failed")
      }
      return "Chrome"
    }
  })

  assert.deepEqual(result.extensions, [
    { id: "extension-a", name: "A", channel: "Chrome" },
    { id: "extension-b", name: "B" }
  ])
  assert.deepEqual(
    result.errors.map(({ stage, extensionId }) => ({ stage, extensionId })),
    [
      { stage: "icons", extensionId: undefined },
      { stage: "channel", extensionId: "extension-b" }
    ]
  )
})

test("successful cache enhancements add icons and channels without changing list order", async () => {
  const extensions = [
    { id: "extension-a", name: "A" },
    { id: "extension-b", name: "B" }
  ]

  const result = await collectExtensionEnhancements(extensions, {
    loadIcons: async (items) =>
      items.map((item) => ({ ...item, icon: `data:image/png;base64,${item.id}` })),
    loadChannel: async (extensionId) => (extensionId === "extension-a" ? "Chrome" : "Development")
  })

  assert.deepEqual(result.errors, [])
  assert.deepEqual(result.extensions, [
    {
      id: "extension-a",
      name: "A",
      icon: "data:image/png;base64,extension-a",
      channel: "Chrome"
    },
    {
      id: "extension-b",
      name: "B",
      icon: "data:image/png;base64,extension-b",
      channel: "Development"
    }
  ])
})

test("extension enhancement updates merge without dropping existing records", () => {
  assert.deepEqual(
    mergeExtensionsById(
      [
        { id: "extension-a", name: "A" },
        { id: "extension-b", name: "B" }
      ],
      [{ id: "extension-b", icon: "data:image/png;base64,icon" }]
    ),
    [
      { id: "extension-a", name: "A" },
      { id: "extension-b", name: "B", icon: "data:image/png;base64,icon" }
    ]
  )
})
