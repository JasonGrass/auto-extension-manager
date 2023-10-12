<img src="src/assets/img/design-devin/Light-128.png" width="64"/>

# Extension Manager

[![release](https://img.shields.io/github/v/release/JasonGrass/auto-extension-manager?style=for-the-badge)](https://github.com/JasonGrass/auto-extension-manager/releases)
[![chrome-web-store](https://img.shields.io/chrome-web-store/v/efajbgpnlnobnkgdcgcnclngeolnmggp?style=for-the-badge)](https://chrome.google.com/webstore/detail/extension-manager/efajbgpnlnobnkgdcgcnclngeolnmggp)
[![users](https://img.shields.io/chrome-web-store/users/efajbgpnlnobnkgdcgcnclngeolnmggp.svg?style=for-the-badge)](https://chrome.google.com/webstore/detail/extension-manager/efajbgpnlnobnkgdcgcnclngeolnmggp)
[![stars](https://img.shields.io/chrome-web-store/stars/efajbgpnlnobnkgdcgcnclngeolnmggp?style=for-the-badge)](https://chrome.google.com/webstore/detail/extension-manager/efajbgpnlnobnkgdcgcnclngeolnmggp)

[中文](./README.md)

## 🍉 Feature

A simple way to manage your chrome extensions

🍕 **Core Features**

* Flexible rule customization to automatically enable or disable browser extensions.

Matching conditions: URL / Profile / Operating system / Time.

Actions: Enable when match, Close when match, Enable only when match, Disbale only when match, Custom; Support automatically refreshing the page after enabling or disabling extensions.

🍕 **Basic Features**

* One-click enable or disable extensions.
* Batch enable or disable extensions through grouping.
* Quick search extensions by extension name, description, alias, or note.
* Extension management: Quickly navigate to settings page, homepage, uninstall extensions.
* List view and grid view.
* One-click launch for app-type extensions.
* Set custom aliases and notes.
* History: Extension installation, update, uninstall, enable, and disable.

🍕 **Others**

* Rich configurable options for customizing style and functionality.  
* Open-source code with no collection of any user privacy data.

## 🍉 Download

Chrome Web Store
<https://chrome.google.com/webstore/detail/extension-manager/efajbgpnlnobnkgdcgcnclngeolnmggp>

Edge Web Store  
<https://microsoftedge.microsoft.com/addons/detail/pifijhmfdnkanlcnecpifkmjbfoopokf>

> Edge's review process is relatively slow, so the version may lag behind the Chrome store.

## 🍉 LOGO

|                           Old                           |                           New-Light                           |                           New-Dark                           |
|:-------------------------------------------------------:|:-------------------------------------------------------------:|:------------------------------------------------------------:|
| <img src="src/assets/img/old/icon-128.png" width="64"/> | <img src="src/assets/img/design-devin/Light.svg" width="64"/> | <img src="src/assets/img/design-devin/Dark.svg" width="64"/> |

Thank [0xe8nicebot](https://github.com/0xe8nicebot) for contributing to the project by designing the logo.
About author：<https://devinwang.com/>，There is the AI tool he created.：[不管是现在还是未来，你的全能Ai小助手](https://chatboy.io/r/spi6jpul)

## 🍉 Help

Document(in Chinese)： <https://ext.jgrass.cc/docs/intro>  
Blog(in Chinese)： <https://ext.jgrass.cc/blog>

Feedback can be submitted via [issue](https://github.com/JasonGrass/auto-extension-manager/issues/new?body=%0A%0A%0A%0A---%0A%3C!--+%E2%86%91Please%20write%20the%20details%20of%20the%20question/suggestion%20at%20the%20top%20of%20this%20line%E2%86%91+--%3E%0AFrom+readme+%0A)

**🎃 FAQ**

🔖 Why is there no version for Firefox?

Firefox does not provide a critical API for enabling and disabling extensions, see [#5](https://github.com/JasonGrass/auto-extension-manager/issues/5)

🔖 Why can't launch other extensions directly from the Extension Manager, or Pin other extensions to the browser toolbar?

The browser does not provide the relevant APIs, and those operations need to be performed manually by the user.

🔖 About extension of APP type

APP type extensions are being deprecated, PWA applications are not in the framework of browser extensions (so some browser APPs are not visible in the extension manager). It's rare to see a working APP-type extension anymore.

If you turn on `Display extensions of the APP type`, you may find that many APP-type extensions can not start.
You can open <chrome://apps> to see the details.

ref: <https://chromium.googlesource.com/chromium/src/+/HEAD/extensions/docs/extension_and_app_types.md>

## 🍉 Internationalization

[chrome.i18n - Chrome for Developers](https://developer.chrome.com/docs/extensions/reference/i18n/ )

Language files are located in the `src/_locales` folder.
If you find any translation issues, you can provide feedback in the issue section or directly submit a PR for correction.

Thanks to [Ruri-1973](https://github.com/Blank-1973) for Japanese translation. #79

## 🍉 Other

This project is built based on [lxieyang/chrome-extension-boilerplate-react](https://github.com/lxieyang/chrome-extension-boilerplate-react )

---

[<img src="src/assets/img/buymeacoffee.svg" width="128" alt="buy me a coffee"/>](https://www.buymeacoffee.com/jgrass/extension-manager?utm_source=readmeen)
