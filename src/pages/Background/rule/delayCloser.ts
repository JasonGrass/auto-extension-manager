const DELAY_TIME = 1000

export class DelayCloseToken {
  public static DelayTime: number = DELAY_TIME

  public Id: string
  public Available: boolean

  public constructor(id: string) {
    this.Id = id
    this.Available = true
  }

  public cancel() {
    this.Available = false
  }
}

class DelayCloser {
  private _waiting: DelayCloseToken[]

  public constructor() {
    this._waiting = []
  }

  // 延迟关闭扩展
  public close(info: chrome.management.ExtensionInfo, after: () => void) {
    const token = new DelayCloseToken(info.id)
    this._waiting.push(token)

    setTimeout(
      async (t) => {
        this.removeIneffective()
        if (!t.Available) {
          // 此关闭动作无效，则不再执行
          return
        }
        console.log(`[Extension Manager] disable extension [${info.name}]`)
        await chrome.management.setEnabled(info.id, false)
        after?.()
      },
      DELAY_TIME,
      token // 触发关闭动作时的 token，此 token 用于记录这个关闭动作是否还有效
    )

    return token
  }

  // 取消指定扩展的禁用动作
  public cancel(extId: string) {
    const list = this._waiting
    for (const item of list.filter((i) => i.Id === extId)) {
      item.cancel()
    }
    this.removeIneffective()
  }

  // 从缓存中移除掉所有已经失效的 token，避免内存浪费
  private removeIneffective() {
    for (const item of this._waiting.filter((i) => !i.Available)) {
      this._waiting.slice(this._waiting.indexOf(item), 1)
    }
  }
}

function buildDelayCloserGetter() {
  let closer: DelayCloser | undefined = undefined
  return () => {
    if (closer === undefined) {
      closer = new DelayCloser()
    }
    return closer
  }
}

export const getDelayCloser = buildDelayCloserGetter()
