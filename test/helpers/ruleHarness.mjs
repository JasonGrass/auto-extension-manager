import { createSourceLoader, flush } from "./loadSource.mjs"

export const scene = { trigger: "sceneTrigger", config: { sceneIds: ["S"] } }
export const rule = (
  action = { actionType: "openWhenMatched" },
  target = { extensions: ["A"] }
) => ({
  id: "R",
  version: 2,
  enable: true,
  match: { relationship: "and", triggers: [scene] },
  action,
  target
})

export function ruleHarness() {
  const calls = [],
    records = [],
    timers = [],
    errors = []
  const enabled = new Map()
  const tab = { id: 1, url: "https://example.com/", active: true }
  const h = {
    calls,
    records,
    timers,
    enabled,
    tab,
    errors,
    options: { ruleConfig: [], groups: [], scenes: [{ id: "S" }] },
    activeIds: ["S"]
  }
  const local = {
    getActiveSceneIds: async () => [...h.activeIds],
    setActiveSceneIds: async (ids) => {
      h.activeIds = [...ids]
    }
  }
  const chrome = {
    runtime: { id: "self", getPlatformInfo: async () => ({ os: "win" }) },
    tabs: { query: async () => [tab], reload: async (id) => calls.push(["reload", id]) },
    management: {
      get: async (id) => ({ id, name: id, enabled: enabled.get(id) ?? false }),
      setEnabled: async (id, value) => {
        calls.push([id, value])
        enabled.set(id, value)
      }
    }
  }
  const storage = {
    options: { getAll: async () => structuredClone(h.options) },
    scene: { setActiveIds: local.setActiveSceneIds }
  }
  const quiet = {
    log() {},
    debug() {},
    info() {},
    warn() {},
    error: (...args) => errors.push(args)
  }
  const load = createSourceLoader(
    {
      "webext-polyfill-kinda": chrome,
      ".../utils/logger": () => quiet,
      ".../storage/sync": { __esModule: true, default: storage, storage },
      "./options-storage": { SyncOptionsStorage: storage.options },
      "../local/LocalOptions": {
        LocalOptions: class {
          constructor() {
            return local
          }
        }
      }
    },
    {
      chrome,
      console: quiet,
      setTimeout: (fn, _ms, ...args) => {
        timers.push(() => fn(...args))
        return timers.length
      }
    }
  )
  const EM = {
    LocalOptions: local,
    History: {
      EventHandler: {
        onAutoEnabled: (info) => records.push(["enable", info.id]),
        onAutoDisabled: (info) => records.push(["disable", info.id])
      }
    }
  }
  const { RuleHandler } = load("src/pages/Background/rule/RuleHandler.ts")
  const handler = new RuleHandler()
  Object.assign(h, {
    chrome,
    storage,
    load,
    EM,
    handler,
    async init(config = rule(), groups = []) {
      h.options.ruleConfig = config ? [config] : []
      h.options.groups = groups
      handler.init(
        h.activeIds,
        tab,
        structuredClone(h.options.ruleConfig),
        structuredClone(groups),
        EM
      )
      await flush()
    },
    async runTimers() {
      for (const timer of timers.splice(0)) await timer()
    }
  })
  return h
}
