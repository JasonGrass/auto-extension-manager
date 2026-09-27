import assert from "node:assert/strict"
import { test } from "node:test"
import { createSourceLoader, deferred, flush } from "./helpers/loadSource.mjs"

function harness(EM, ready) {
  let listener
  const chrome = {
    runtime: {
      onMessage: {
        addListener: (fn) => {
          listener = fn
        }
      }
    }
  }
  const load = createSourceLoader(
    {
      "webext-polyfill-kinda": chrome,
      ".../utils/logger": () => ({ debug() {} }),
      ".../storage/sync": { scene: { setActiveIds: async () => {} } }
    },
    { chrome, console: { error() {} } }
  )
  load("src/pages/Background/message/messageIndex.js").default(EM, ready)
  return (id, responses) =>
    listener(JSON.stringify({ id }), {}, (response) => responses.push(response))
}

test("configuration messages wait for initialization and acknowledge refresh exactly once", async () => {
  const initialized = deferred(),
    refreshed = deferred()
  const EM = {}
  const send = harness(EM, initialized.promise)
  const responses = []
  assert.equal(send("rule-config-changed", responses), true)
  await flush()
  assert.deepEqual(responses, [])
  EM.Rule = { handler: { refreshConfig: () => refreshed.promise } }
  initialized.resolve()
  await flush()
  assert.deepEqual(responses, [])
  refreshed.resolve()
  await flush()
  assert.deepEqual(responses, [{ state: "success" }])
})

test("refresh failures receive an error response and unknown messages receive none", async () => {
  const send = harness(
    {
      Rule: {
        handler: {
          refreshConfig: async () => {
            throw new Error("read failed")
          }
        }
      }
    },
    Promise.resolve()
  )
  const responses = []
  send("rule-config-changed", responses)
  send("unknown", responses)
  await flush()
  assert.deepEqual(responses, [{ state: "error", message: "read failed" }])
})
