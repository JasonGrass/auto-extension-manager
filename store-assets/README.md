# Extension Manager 商店素材

本套素材基于本地仓库中的**最新、尚未发布的 UI**，配合虚构演示数据制作。
正式商店旧截图仅用于了解更新前的展示方式。
本地 `chrome-extension://` 地址受到浏览器工具访问策略限制，因此从仓库真实组件
在隔离的本地网页中渲染并截图，未直接读取或操作个人浏览器中的扩展。

## 上传对应表

| 位置                     | 文件目录             | 张数 / 尺寸               |
| ------------------------ | -------------------- | ------------------------- |
| 中文本地化截图           | `screenshots/zh-CN/` | 5 张，1280×800            |
| 英文 / 全球截图          | `screenshots/en/`    | 5 张，1280×800            |
| Chrome 小型 / 顶部宣传图 | `promos/global/`     | 440×280、1400×560 各 1 张 |
| Edge 中文宣传图          | `promos/zh-CN/`      | 440×280、1400×560 各 1 张 |
| Edge 英文宣传图          | `promos/en/`         | 440×280、1400×560 各 1 张 |

上传图片均为 24 位 RGB PNG，没有 alpha 通道。各组截图按文件名 01–05 排序：
分组管理、自动规则、情景模式、清单分享、操作历史。
预览拼图 `preview-zh-CN.png` 和 `preview-en.png` 只用于审阅，不上传到商店。
`extension-manager-store-upload.zip` 包含全部上传图、对应表与校验清单。

Chrome 的宣传图不按语言切换，通用版仅保留品牌名。
Edge 可使用各语言对应的宣传图。
来源：[Chrome 图片规范](https://developer.chrome.com/docs/webstore/images)、
[Edge 上架规范](https://learn.microsoft.com/en-us/microsoft-edge/extensions/publish/publish-extension)。

## 源文件与再次导出

- `capture/`：独立的 UI 截图入口、浏览器 API 模拟和演示数据；使用仓库真实组件与翻译。
- `raw/`：实际渲染页面的原始截图。
- `source/render.mjs`：确定性排版、准确文字和 Logo 合成；修改这里可调整文案和版式。
- `source/art/`：现有项目 Logo 副本和 ImageGen 生成的装饰背景。
- `manifest.json`：16 张上传图的清单与尺寸。
- `verification.json`：PNG 格式、尺寸和透明度校验结果。

从仓库根目录执行：

```powershell
node store-assets/capture/build.cjs
node store-assets/source/serve.mjs
# 用截图工具访问 http://127.0.0.1:15302/capture/dist/，URL 参数见 capture/NOTES.md。
# 替换 raw/ 下相应的中英截图后：
node store-assets/source/render.mjs
node store-assets/source/verify.mjs
```

排版导出使用 Codex 提供的 `sharp`；若在其它电脑导出，需在可用的 Node 模块路径提供 `sharp`。
截图入口使用项目既有构建依赖，产物不进入扩展发布包。
演示扩展与数据均为虚构，浏览器 API 不连接真实扩展；截图没有来自个人浏览器的配置或记录。

## 设计与真实性

采用现有黑白节点 Logo、品牌蓝 `#4668d8`、明亮的产品界面和短标题。
中英文截图对应同一组场景；英文沿用项目实际使用的 `Profile` 术语。
情景模式与已配置规则搭配使用；清单导入不等于自动安装所有扩展或迁移其它扩展的数据。

装饰背景由内置 ImageGen 生成，其余界面、Logo 与文字独立排版。生成提示词见
`source/art/prompt.txt`。不更改现有 Logo，不用 AI 重绘应用界面。

本次交付是素材文件，不包含商店上传或发布操作。
