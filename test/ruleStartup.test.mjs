import assert from "node:assert/strict"
import test from "node:test"
import { createSourceLoader, deferred, flush } from "./helpers/loadSource.mjs"

test("history construction precedes rules while dependent listeners wait for extensions", async () => {
  const migration = deferred(),
    extensions = deferred()
  const calls = []
  const history = { EventHandler: {} }
  const chrome = {
    runtime: {
      onInstalled: { addListener: () => calls.push("installed-listener") },
      onMessage: { addListener: () => calls.push("message-listener") }
    }
  }
  const load = createSourceLoader(
    {
      "webext-polyfill-kinda": chrome,
      ".../storage/sync": { scene: { setActiveIds: async () => {} } },
      ".../storage/local": {
        LocalOptions: class {
          migrate() {
            return migration.promise
          }
        }
      },
      ".../utils/logger": () => ({ init() {} }),
      "./history": {
        __esModule: true,
        default: () => {
          calls.push("history")
          return history
        },
        startHistoryEvents: (EM) => {
          assert.ok(EM.Extension)
          calls.push("history-listeners")
        }
      },
      "./rule": {
        __esModule: true,
        default: async (EM) => {
          assert.equal(EM.History, history)
          calls.push("rules")
          return {}
        }
      },
      "./extension": { __esModule: true, default: () => extensions.promise }
    },
    { chrome, console: { log() {}, error() {} } }
  )
  load("src/pages/Background/index.js")
  assert.deepEqual(calls, ["installed-listener", "message-listener"])
  migration.resolve()
  await flush()
  assert.deepEqual(calls.slice(2), ["history", "rules"])
  extensions.resolve({})
  await flush()
  assert.equal(calls.at(-1), "history-listeners")
})
