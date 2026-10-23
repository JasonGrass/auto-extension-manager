export type RuleUrlSnapshot = {
  tabId?: number
  windowId?: number
  navigationId?: string
  urlSource: "pendingUrl" | "url"
  committedUrl: string | null
  pendingUrl: string | null
  matchUrl: string | null
}
export type RuleTrace = {
  id: string
  startedAt: number
  configRevision: number
  stateRevision: number
  phase: "pending" | "committed"
  urls: WeakMap<chrome.tabs.Tab, RuleUrlSnapshot>
}
type TraceContext = {
  trace?: RuleTrace
  tab?: chrome.tabs.Tab | null
  phase?: "pending" | "committed"
  navigationId?: string
  rule?: { id?: string }
}

export function describeRuleTab(ctx: TraceContext, tab = ctx.tab): RuleUrlSnapshot | null {
  if (!tab) return null
  const saved = ctx.trace?.urls.get(tab)
  return saved
    ? { ...saved }
    : {
        tabId: tab.id,
        windowId: tab.windowId,
        urlSource: "url",
        committedUrl: tab.url ?? null,
        pendingUrl: tab.pendingUrl ?? null,
        matchUrl: tab.url ?? null
      }
}

/** Log small value snapshots, never the mutable context or EM service graph. */
export function traceRule(ctx: TraceContext | undefined, event: string, details = {}) {
  console.log(`[Rule trace] ${event}`, {
    evaluationId: ctx?.trace?.id ?? null,
    elapsedMs: ctx?.trace ? performance.now() - ctx.trace.startedAt : null,
    configRevision: ctx?.trace?.configRevision,
    stateRevision: ctx?.trace?.stateRevision,
    phase: ctx?.trace?.phase ?? ctx?.phase,
    ...(ctx ? describeRuleTab(ctx) : null),
    navigationId: ctx?.navigationId,
    ruleId: ctx?.rule?.id,
    ...details
  })
}
