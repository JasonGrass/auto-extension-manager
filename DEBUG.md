# 如何调试

运行 `npm run start`

会在 `build` 目录中生成扩展的源码，

在 Chrome/Edge 浏览器中，通过 `加载已解压的扩展程序` 加载扩展。

然后在浏览器中，打开如下的 URL (id 换成实际的扩展 id)，通过 F12 进行调试

`chrome-extension://opcmoomidakficjacpfidefgmbdljmac/popup.html`
`chrome-extension://opcmoomidakficjacpfidefgmbdljmac/options.html`

[![debug](https://s21.ax1x.com/2025/04/12/pERyRHA.png)](https://imgse.com/i/pERyRHA)

## 规则执行链路日志

在 `chrome://extensions` 或 `edge://extensions` 中找到本扩展，打开后台 Service Worker 的
DevTools Console。开发和生产构建均默认通过 `console.log` 输出规则链路日志，
再复现导航、切换标签或修改规则即可；Worker 重建后的日志同样默认输出。

每轮规则执行都有 `evaluationId`，并携带 `navigationId`、`configRevision`、`stateRevision`、
`phase`、`elapsedMs`。规则和扩展操作另外记录 `ruleId`、`extensionId`，跳过或取消时记录
`reason`。初始化和原始浏览器事件发生时尚未分配执行轮次，可通过标签 ID、导航 ID 和状态版本
与后续执行对应。

URL 字段分别表示：

| 字段           | 含义                                     |
|----------------|------------------------------------------|
| `committedUrl` | 浏览器 Tab 快照中的已提交 `url`          |
| `pendingUrl`   | 可获取的待导航地址；没有时为 `null`       |
| `matchUrl`     | 本次实际交给规则匹配器的地址             |
| `urlSource`    | `pendingUrl` 或 `url`，明确实际使用的字段 |
| `matchedTab`   | 命中标签的独立 URL 快照，可能是后台标签   |

`phase: "pending"` 只代表本轮存在待提交导航，不能据此认定当前页也使用了 `pendingUrl`。
例如当前页仍使用 `url`，后台标签使用 `pendingUrl` 命中任一标签规则时，日志会分别记录两者。
这些字段按输出时的值记录，不直接打印后续会变化的执行上下文。

链路中的主要日志依次为：

1. `event.received` / `event.navigation`：事件、原始 URL 和导航归属；重复事件记录忽略原因。
2. `evaluation.started`：本轮上下文、场景和规则数量。
3. `tabs.query.*`、`rule.match.*`、`rule.conditions`：按需查询、各条件结果和命中标签。
4. `task.resolved`、`execution.started`：规则冲突优先级和最终动作。
5. `extension.state.*`、`operation.*`：当前启用状态、启用结果，以及延迟禁用的排队、执行和取消。
6. `history.*`：自动操作历史的写入结果。
7. `reload.*`：刷新意图保存/恢复、页面核验、延期/取消原因及实际刷新派发。
8. `evaluation.completed`：规则调度轮结束及耗时/API 次数。延迟禁用不阻塞调度轮，其最终结果
   和 `execution.completed` 可以晚于此日志出现，仍使用原 `evaluationId`。
