# Store screenshot capture harness

Build from the repository root with `node store-assets/capture/build.cjs`. Serve
`store-assets/` as a static directory and open `/capture/dist/index.html`.
For example, if the static server uses port 15302:

| Screen                 | URL suffix                                     |
| ---------------------- | ---------------------------------------------- |
| Rule table             | `?locale=zh_CN&page=options#/rule`             |
| Scene cards            | `?locale=zh_CN&page=options#/scene`            |
| Share wizard           | `?locale=zh_CN&page=options#/management/share` |
| History                | `?locale=zh_CN&page=options#/history`          |
| Grouped popup list     | `?locale=zh_CN&page=popup&layout=list`         |
| Popup grid (ungrouped) | `?locale=zh_CN&page=popup&layout=grid`         |

Use `locale=en` for English. The options page uses the real HashRouter; the
popup uses the real list/grid components. To show the rule editor, click the
add or edit control on the rule table. For the share output, click Next twice
in the share wizard. `window.__captureReady` is set after storage seeding; the
document shows a startup error if seeding or import fails.

Add `scale=2` to any URL to zoom the whole document to 200% for a larger
browser screenshot. For options, use a 2560 × 1200 viewport to retain the
same effective layout as 1280 × 600. The default scale is 1.

Before saving each screenshot, return the page to the top (Ctrl+Home), then
inspect the actual captured image. Route changes can preserve the previous
scroll position; finding text in the accessibility tree alone does not prove
that it is inside the screenshot. The scene image must include the page title,
Add Profile button and all three complete Work/Study/Leisure cards. Check the
composited upload PNG too before refreshing the preview and upload ZIP.

This bundle compiles the unmodified current React entrypoints, with the real
storage facades. It installs an isolated synthetic `chrome` API before dynamic
imports, seeds eight fictional extensions, three named groups and scenes, five rules and
deterministic history. Extension icons are local SVG data URLs. Analytics,
version checks, icon rebuilding and channel lookup are stubbed so capture does
not use credentials, extension APIs or external services. It writes only to
the static page's own local storage and IndexedDB origin. Do not use a live
extension origin for this harness.

The generated `dist/` files are disposable. Rebuild when app source changes.
