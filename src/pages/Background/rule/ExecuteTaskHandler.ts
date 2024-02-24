import chromeP from "webext-polyfill-kinda"

import { DelayCloseToken, getDelayCloser } from "./delayCloser"
import { IMatchResult } from "./handlers/matchHandler"
import type { ProcessContext, RunningProcessContext } from "./processor"

/**
 * 启用或禁用扩展的任务描述
 */
export type ExecuteTask = {
  /**
   * 执行类型，启用扩展还是禁用扩展
   */
  executeType?: "enable" | "disable"

  /**
   * 执行目标，扩展的 ID
   */
  targetExtensions: string[]

  /**
   * 执行之后是否重新加载当前页面
   */
  reload: boolean | undefined

  /**
   * 当前打开的 tab 信息
   */
  tabInfo: chrome.tabs.Tab | null

  /**
   * 规则执行上下文的其他信息
   */
  ctx: RunningProcessContext

  /**
   * 执行优先级
   */
  priority: ExecuteTaskPriority
}

/**
 * 在本轮执行中，规则执行任务的优先级
 */
export class ExecuteTaskPriority {
  private _priority = 0

  get priority() {
    return this._priority
  }

  // 不匹配的执行，优先级降低 100
  setNotMatch() {
    this._priority -= 100
  }
}

export class ExecuteTaskHandler {
  private _taskMap: Map<string, ExecuteTask> = new Map()
  private _tasks: ExecuteTask[] = []

  /**
   * 添加扩展关闭任务
   */
  close(task: ExecuteTask) {
    task.executeType = "disable"
    this.addTask(task)
  }

  /**
   * 添加扩展开启任务
   */
  open(task: ExecuteTask) {
    task.executeType = "enable"
    this.addTask(task)
  }

  private addTask(task: ExecuteTask) {
    for (const extId of task.targetExtensions) {
      if (!this._taskMap.has(extId)) {
        this._taskMap.set(extId, task)
        continue
      }

      const oldTask = this._taskMap.get(extId)!
      if (oldTask.priority.priority < task.priority.priority) {
        oldTask.targetExtensions = oldTask.targetExtensions.filter((i) => i !== extId)
        this._taskMap.set(extId, task)
        console.log("移除冲突的规则处理", "extensionId", extId, "ruleId", oldTask.ctx.rule?.id)
      } else {
        task.targetExtensions = task.targetExtensions.filter((i) => i !== extId)
        console.log("移除冲突的规则处理", "extensionId", extId, "ruleId", task.ctx.rule?.id)
      }
    }

    this._tasks.push(task)
  }

  /**
   * 统一执行全部的规则
   */
  async execute() {
    for (const task of this._tasks) {
      const { executeType, targetExtensions, reload, tabInfo, ctx } = task
      if (executeType === "enable") {
        await openExtensions(targetExtensions, reload, tabInfo, ctx)
      } else {
        await closeExtensions(targetExtensions, reload, tabInfo, ctx)
      }
    }
  }
}

async function closeExtensions(
  targetExtensions: string[],
  reload: boolean | undefined,
  tabInfo: chrome.tabs.Tab | null,
  ctx: ProcessContext
) {
  let worked = false

  let delayToken: DelayCloseToken | undefined
  for (const extId of targetExtensions) {
    try {
      const info = await chromeP.management.get(extId)
      if (!info || !info.enabled) {
        continue
      }
      // 检查在所有打开的页面中，是否有目标扩展的设置页面，如果存在，则暂时不关闭扩展
      const settingTab = ctx.tabs?.find((tab) => {
        return tab.url?.includes(`/${extId}/`)
      })
      if (settingTab) {
        console.info(`[Rule] exist page about ${extId}, cancel disable`)
        continue
      }

      const delayCloser = getDelayCloser()
      delayToken = delayCloser.close(info, () => {
        // 历史记录
        ctx.EM?.History.EventHandler.onAutoDisabled(info, ctx.rule!)
      })

      worked = true
    } catch (err) {
      console.warn(`Disable Extension fail (${extId}).`, err)
    }
  }

  if (worked && reload && tabInfo && tabInfo.id) {
    const token = delayToken
    const closureTabInfo = tabInfo
    setTimeout(async () => {
      if (token?.Available) {
        try {
          await chrome.tabs.reload(closureTabInfo.id!)
          console.log(
            `[Extension Manager] reload tab [${closureTabInfo.title}](${closureTabInfo.url})`
          )
        } catch (err) {
          console.warn(`closeExtensions reload tab fail.`, tabInfo, err)
        }
      }
    }, DelayCloseToken.DelayTime + 50)
  }
}

async function openExtensions(
  targetExtensions: string[],
  reload: boolean | undefined,
  tabInfo: chrome.tabs.Tab | null,
  ctx: ProcessContext
) {
  let worked = false

  for (const extId of targetExtensions) {
    try {
      const delayCloser = getDelayCloser()
      delayCloser.cancel(extId)

      const info = await chromeP.management.get(extId)
      if (!info || info.enabled) {
        continue
      }

      console.log(`[Extension Manager] enable extension [${info.name}]`)
      await chromeP.management.setEnabled(extId, true)
      ctx.EM?.History.EventHandler.onAutoEnabled(info, ctx.rule!)
      worked = true
    } catch (err) {
      console.warn(`Enable Extension fail (${extId}).`, err)
    }
  }

  if (worked && reload && tabInfo && tabInfo.id) {
    chrome.tabs.reload(tabInfo.id)
    console.log(`[Extension Manager] reload tab [${tabInfo.title}](${tabInfo.url})`)
  }
}
