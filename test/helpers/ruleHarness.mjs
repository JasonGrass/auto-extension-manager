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

export function ruleHarness(session = {}, enabled = new Map()) {
  const calls = [],
    records = [],
    timers = [],
    errors = [],
    logs = []
  const tab = { id: 1, windowId: 1, url: "https://example.com/", active: true }
  const h = {
    calls,
    records,
    timers,
    enabled,
    tab,
    errors,
    logs,
    session,
    queryCount: 0,
    options: { ruleConfig: [], groups: [], scenes: [{ id: "S" }] },
    activeIds: ["S"]
  }
  const local = {
    getActiveSceneIds: async () => [...h.activeIds],
    setActiveSceneIds: async (ids) => {
      h.activeIds = [...ids]
    }
  }
  const event = () => {
    let listener
    return {
      addListener(fn) {
        listener = fn
      },
      fire(...args) {
        listener?.(...args)
      }
    }
  }
  const events = Object.fromEntries(
    ["updated", "activated", "created", "removed", "replaced", "focused", "windowRemoved"].map(
      (name) => [name, event()]
    )
  )
  const chrome = {
    runtime: { id: "self", getPlatformInfo: async () => ({ os: "win" }) },
    storage: {
      session: {
        get: async (key) => ({ [key]: structuredClone(session[key]) }),
        set: async (items) => Object.assign(session, structuredClone(items))
      }
    },
    tabs: {
      onUpdated: events.updated,
      onActivated: events.activated,
      onCreated: events.created,
      onRemoved: events.removed,
      onReplaced: events.replaced,
      query: async (_query, callback) => {
        h.queryCount++
        callback?.([{ ...tab }])
        return [tab]
      },
      get: async (id) => {
        if (id !== tab.id) throw new Error("Tab closed")
        return { ...tab }
      },
      reload: async (id) => calls.push(["reload", id])
    },
    windows: {
      onFocusChanged: events.focused,
      onRemoved: events.windowRemoved,
      WINDOW_ID_NONE: -1
    },
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
    log: (...args) => logs.push(args),
    debug: (...args) => logs.push(args),
    info() {},
    warn() {},
    error: (...args) => errors.push(args)
  }
  const load = createSourceLoader(
    {
      "webext-polyfill-kinda": chrome,
      ".../utils/logger": () => quiet,
      "../../../utils/logger.js": () => quiet,
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
    events,
    async start() {
      const createRule = load("src/pages/Background/rule/index.js").default
      EM.Rule = await createRule(EM)
      h.handler = EM.Rule.handler
      await flush()
    },
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
      await flush()
    }
  })
  return h
}
