<img src="src/assets/img/design-devin/Light.svg" width="64"/>

# Extension Manager

[![release](https://img.shields.io/github/v/release/JasonGrass/auto-extension-manager)](https://github.com/JasonGrass/auto-extension-manager/releases)

[English](./README.en.md)

## 🍉 功能介绍

Extension Manager 是一个用于浏览器扩展管理的扩展。

🍕 **核心功能**

灵活的规则自定义，自动启用或禁用指定的浏览器扩展。

多种匹配条件： URL / 情景模式 / 操作系统 / 时间

多种动作：匹配后打开，匹配后关闭，匹配才打开，匹配才关闭，自定义；并支持启用与禁用扩展后，自动刷新页面。

🍕 **基础功能**

- 一键启用或禁用扩展
- 通过分组批量启用或禁用扩展
- 通过扩展名，扩展描述，别名或备注快速搜索扩展
- 扩展管理：快速跳转设置页面, HomePage, 卸载扩展
- 列表视图与网格视图
- APP 类型扩展一键启动
- 设置自定义别名与备注，以别名显示扩展
- 扩展安装、更新、卸载、启用与禁用的历史记录

🍕 **其它**

- 丰富的可配置选项，自定义样式和功能
- 代码开源，不收集任何用户隐私数据

## 🍉 下载

Chrome 商店链接  
<https://chrome.google.com/webstore/detail/extension-manager/efajbgpnlnobnkgdcgcnclngeolnmggp>

Edge 商店链接  
<https://microsoftedge.microsoft.com/addons/detail/pifijhmfdnkanlcnecpifkmjbfoopokf>

> Edge 的审核比较慢，所以版本可能会落后于 Chrome 商店

如果无法访问 Chrome 商店可以使用 [crxsoso.com](https://www.crxsoso.com/webstore/detail/efajbgpnlnobnkgdcgcnclngeolnmggp) 进行离线安装。

## 🍉 LOGO

|                           Old                           |                           New-Light                           |                           New-Dark                           |
|:-------------------------------------------------------:|:-------------------------------------------------------------:|:------------------------------------------------------------:|
| <img src="src/assets/img/old/icon-128.png" width="64"/> | <img src="src/assets/img/design-devin/Light.svg" width="64"/> | <img src="src/assets/img/design-devin/Dark.svg" width="64"/> |

感谢 [0xe8nicebot](https://github.com/0xe8nicebot) 为项目贡献 logo 设计。  
关于作者：<https://devinwang.com/>，还有其创建的 AI 工具：[不管是现在还是未来，你的全能Ai小助手](https://chatboy.io/r/spi6jpul)

## 🍉 帮助

说明文档： <https://ext.jgrass.cc/docs/intro>  
博客： <https://ext.jgrass.cc/blog>

也可以直接通过 [issue](https://github.com/JasonGrass/auto-extension-manager/issues/new?body=%0A%0A%0A%0A---%0A%3C%21--+%E2%86%91%E8%AF%B7%E5%9C%A8%E6%AD%A4%E8%A1%8C%E4%B8%8A%E6%96%B9%E5%A1%AB%E5%86%99%E9%97%AE%E9%A2%98%2F%E5%BB%BA%E8%AE%AE%E8%AF%A6%E6%83%85%E2%86%91+--%3E%0AFrom+readme+%0A) 来提交反馈。

在 [小众软件](https://meta.appinn.net/t/topic/46198) 上讨论。

**🎃 常见问题**

🔖 为什么没有 Firefox 版本

Firefox 没有提供启用和禁用扩展这个核心的 API，详见 [#5](https://github.com/JasonGrass/auto-extension-manager/issues/5)

🔖 为什么不能在扩展管理器中直接启动其它扩展，或者将其它扩展 Pin 到浏览器工具栏上

浏览器没有提供相关的 API，相关操作需要用户手动执行

> PS 如果哪天有这些 API 了，记得提 issue 告诉我

🔖 关于 APP 类型扩展

APP 类型的扩展正在被废弃，PWA 应用不在浏览器扩展的框架内（所以有些浏览器 APP 在扩展管理中看不到）。很少见还有能用的 APP 类型扩展了。
如果开启 `显示 APP 类型扩展`，可能发现很多 APP 类型扩展无法启动。可以打开 <chrome://apps> 查看详情。

参考链接：<https://chromium.googlesource.com/chromium/src/+/HEAD/extensions/docs/extension_and_app_types.md>

## 🍉 其它

本项目基于 [lxieyang/chrome-extension-boilerplate-react](https://github.com/lxieyang/chrome-extension-boilerplate-react ) 构建

---

[<img src="src/assets/img/buymeacoffee.svg" width="128"/>](https://www.buymeacoffee.com/jgrass/extension-manager)
