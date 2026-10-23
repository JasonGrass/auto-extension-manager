const DELAY_TIME = 1000
type DisableResult = "disabled" | "cancelled" | "failed"

export class DelayCloseToken {
  public static DelayTime = DELAY_TIME
  public Available = true
  public started = false
  private resolve!: (result: DisableResult) => void
  public readonly done = new Promise<DisableResult>((resolve) => {
    this.resolve = resolve
  })
  constructor(public Id: string) {}
  public finish(result: DisableResult) {
    this.resolve(result)
  }
  public cancel() {
    this.Available = false
    if (!this.started) this.finish("cancelled")
  }
}

class DelayCloser {
  private waiting = new Set<DelayCloseToken>()
  public close(
    info: chrome.management.ExtensionInfo,
    after: () => void,
    isCurrent: () => boolean = () => true,
    before: () => Promise<void> = async () => {},
    ctx?: ProcessContext
  ) {
    const token = new DelayCloseToken(info.id)
    this.waiting.add(token)
    setTimeout(async () => {
      if (!token.Available || !isCurrent()) {
        traceRule(ctx, "operation.disable.cancelled", {
          extensionId: info.id,
          reason: !token.Available ? "token-cancelled" : "stale-before-delay"
        })
        token.cancel()
        this.waiting.delete(token)
        return
      }
      token.started = true
      try {
        await before()
        if (!token.Available || !isCurrent()) {
          traceRule(ctx, "operation.disable.cancelled", {
            extensionId: info.id,
            reason: !token.Available ? "token-cancelled" : "stale-before-api"
          })
          token.finish("cancelled")
          return
        }
        traceRule(ctx, "operation.disable.started", { extensionId: info.id })
        await chrome.management.setEnabled(info.id, false)
        token.finish("disabled")
        try {
          after()
        } catch (error) {
          console.warn("Disable history failed", error)
        }
      } catch (error) {
        token.finish("failed")
        token.Available = false
        console.warn("Disable extension failed", info.id, error)
      }
    }, DELAY_TIME)
    return token
  }
  public release(token: DelayCloseToken) {
    this.waiting.delete(token)
  }
  public cancel(extId: string) {
    for (const token of this.waiting) {
      if (token.Id === extId) {
        token.cancel()
        this.waiting.delete(token)
      }
    }
  }
  public cancelAll() {
    for (const token of this.waiting) token.cancel()
    this.waiting.clear()
  }
}
let closer: DelayCloser | undefined
export const getDelayCloser = () => (closer ??= new DelayCloser())
import type { ProcessContext } from "./processor"
import { traceRule } from "./ruleTrace"
