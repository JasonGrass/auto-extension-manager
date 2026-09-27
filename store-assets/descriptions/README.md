# 商店产品详情文案

基于根目录 `产品详情.draft.txt` 的五种语言介绍润色，并对照当前仓库核实功能。
每个 `.txt` 文件均为完整详情正文，可直接复制到 Chrome Web Store 或 Microsoft Edge Add-ons
对应语言的产品说明栏；不含内部编辑说明。两家商店共用同一份语言文案。

| 语言     | 文件                   |
| -------- | ---------------------- |
| 简体中文 | [zh-CN.txt](zh-CN.txt) |
| 繁體中文 | [zh-TW.txt](zh-TW.txt) |
| English  | [en.txt](en.txt)       |
| 日本語   | [ja.txt](ja.txt)       |
| Русский  | [ru.txt](ru.txt)       |

## 编辑说明

- 以产品定义和功能概述开场，采用中性说明，不在正文中提及具体浏览器名称。
- 按扩展管理、自动规则、情景模式、清单分享、历史与备份、界面设置组织内容，
  功能标题前使用统一的 emoji。
- 五种语言保持功能范围一致；英文沿用界面的 `Profile`，日文沿用草稿的
  `シチュエーションモード`，避免将情景模式误解为浏览器用户配置文件。
- 将“批量导入扩展”明确为导入清单、查看安装状态和批量打开商店页面；实际安装仍需用户确认。
  清单不迁移其他扩展的内部设置或数据。
- 明确情景模式需要与规则关联；时间段仅作为规则条件，不承诺精确定时执行。
- 补充当前实现已有的多情景激活、互斥切换、配置备份及浅色／深色主题。
- 删除旧稿“不收集任何用户隐私数据”的绝对承诺。当前代码包含 Google Analytics 事件上报，
  商店隐私声明需与实际发布版本的数据行为一致。
- 删除正文中的开源介绍及参与邀请句，保留源码、反馈和文档链接。
- 不再将旧式 APP 类型扩展启动作为主要卖点，以免让读者误以为可直接启动任意扩展或 PWA。
- 未加入性能提升、内存节省、自动安装等未经验证的承诺。

## 核对依据

- 原介绍：[产品详情.draft.txt](../../产品详情.draft.txt)。
- 产品功能与浏览器限制：[README.en.md](../../README.en.md)。
- 规则条件与动作：[rule.d.ts](../../src/types/rule.d.ts)。
- 情景切换：[IndexScene.jsx](../../src/pages/Options/scene/IndexScene.jsx)。
- 清单导入：[ImportHandler.jsx](../../src/pages/Options/management/import/ImportHandler.jsx)。
- 配置备份：[ConfigFileBackup.ts](../../src/pages/Options/settings/ConfigFileBackup.ts)。
- 使用统计：[googleAnalyze.js](../../src/utils/googleAnalyze.js)。
