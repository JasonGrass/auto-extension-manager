# 单元测试

单元测试统一放在此目录，使用 Node.js 内置的 `node:test` 和 `node:assert/strict`。

运行全部测试：

```sh
npm test
```

运行指定测试：

```sh
node --no-warnings --test test/ruleTableScroll.test.mjs
```

新增测试使用 `<模块名>.test.mjs` 命名，直接放在此目录，`npm test` 会自动包含。测试直接引用 `src/` 中的业务代码；`utils/` 保留构建和开发脚本。

部分测试直接导入 TypeScript 源文件，需要支持原生 TypeScript 类型擦除的 Node.js 版本；当前已在 Node.js 24 下验证通过。

后台规则与存储测试使用 `helpers/loadSource.mjs` 在内存中编译实际源码，以模拟浏览器 API、
存储和计时器；不会操作真实扩展或用户配置。运行本轮缺陷回归：

```sh
node --no-warnings --test test/ruleConfigRefresh.test.mjs test/configStorage.test.mjs test/ruleMessages.test.mjs test/customRuleActions.test.mjs test/shareText.test.mjs
```

规则启用时机和自动刷新回归：

```sh
node --no-warnings --test test/ruleReloadReliability.test.mjs test/rulePendingNavigation.test.mjs test/ruleExecutionPath.test.mjs test/ruleStartup.test.mjs test/ruleEventTiming.test.mjs
```

覆盖刷新合并与真实禁用完成、历史异常、会话意图恢复、导航取消/重定向、当前/后台标签、
过期查询、按需查询预算及初始化顺序。Worker 恢复通过保留模拟会话存储并重建源码模块验证。
这些测试不替代隔离 Chrome/Edge 配置文件中的扩展加载、实际导航和 Worker 回收验收；
不能据此宣称 Voyager 已在真实浏览器中实现免刷新生效。
