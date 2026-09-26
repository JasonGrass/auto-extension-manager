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
