import { readFile, writeFile, mkdir } from "node:fs/promises"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { createRequire } from "node:module"

const require = createRequire(import.meta.url)
let sharp
try {
  sharp = require("sharp")
} catch {
  sharp = require(
    resolve(
      process.env.USERPROFILE,
      ".cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp"
    )
  )
}
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const font = "Microsoft YaHei,Segoe UI,Arial,sans-serif"
const blue = "#4668d8"
const ink = "#202938"
const esc = (s) => s.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
const svg = (w, h, body) =>
  Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><defs><linearGradient id="bg" x2="1" y2="1"><stop stop-color="#f8faff"/><stop offset="1" stop-color="#edf2ff"/></linearGradient><filter id="shadow" x="-30%" y="-30%" width="160%" height="170%"><feDropShadow dx="0" dy="12" stdDeviation="15" flood-color="#344e88" flood-opacity=".14"/></filter></defs>${body}</svg>`
  )
const text = (s, x, y, size = 24, fill = ink, weight = 400, extra = "") =>
  `<text x="${x}" y="${y}" font-family="${font}" font-size="${size}" font-weight="${weight}" fill="${fill}" ${extra}>${esc(s)}</text>`
const lines = (strings, x, y, size, fill = ink, weight = 700, height = 1.25) =>
  strings.map((s, i) => text(s, x, y + i * size * height, size, fill, weight)).join("")
const rect = (x, y, w, h, fill, r = 0, extra = "") =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" ${extra}/>`
const lightLogo = await readFile(resolve(root, "source/art/logo-light.svg"), "utf8")
const darkLogo = await readFile(resolve(root, "source/art/logo-dark.svg"), "utf8")
const logo = (x, y, size, light = false) =>
  `<svg x="${x}" y="${y}" width="${size}" height="${size}" viewBox="0 0 20 20">${(light ? darkLogo.replaceAll("#C7C8CD", "#ffffff") : lightLogo).replace(/<svg[^>]*>|<\/svg>/g, "")}</svg>`
const brand = (x = 52, y = 33) =>
  logo(x, y, 30) + text("Extension Manager", x + 43, y + 23, 22, ink, 600)
const card = (x, y, w, h, r = 14) =>
  rect(x, y, w, h, "#fff", r, 'filter="url(#shadow)" stroke="#dce4f3" stroke-width="1"')
const art = resolve(root, "source/art/promo-background.png")
const manifest = []
async function save(path, pipeline, category, locale) {
  const file = resolve(root, path)
  await mkdir(dirname(file), { recursive: true })
  await pipeline
    .flatten({ background: "#fff" })
    .removeAlpha()
    .png({ palette: false, compressionLevel: 9 })
    .toFile(file)
  const metadata = await sharp(file).metadata()
  if (metadata.hasAlpha || metadata.channels !== 3) throw Error(`Unexpected color mode: ${path}`)
  manifest.push({
    file: path,
    category,
    locale,
    width: metadata.width,
    height: metadata.height,
    channels: metadata.channels
  })
  console.log(path)
}
async function raw(locale, name, w, h) {
  const resized = await sharp(resolve(root, `raw/${locale}/${name}.png`))
    .resize(w, h, { fit: "contain", background: "#f5f7fb" })
    .png()
    .toBuffer()
  return sharp(resized)
    .composite([{ input: svg(w, h, rect(0, 0, w, h, "#fff", 12)), blend: "dest-in" }])
    .png()
    .toBuffer()
}
const copy = {
  "zh-CN": {
    hero: ["扩展再多，", "也井井有条"],
    sub: ["搜索、分组、批量启停", "在一个面板轻松管理"],
    chips: ["分组管理", "一键启停", "列表 / 网格"],
    titles: [
      "让扩展按你的规则运行",
      "不同任务，不同情景",
      "分享你的扩展清单",
      "扩展变化，有迹可查"
    ],
    subtitles: [
      "按网址、情景模式、系统与时间段，自动启用或禁用扩展。",
      "为工作、学习和休闲配置规则，按需切换情景模式。",
      "将扩展清单导出为文本、JSON 或 Markdown，轻松整理与分享。",
      "查看安装、更新、卸载与启停记录，了解每一次变化。"
    ],
    labels: ["自动规则", "情景模式", "清单分享", "操作历史"],
    small: "扩展管理，随你掌控",
    promo: ["扩展管理，", "随你掌控"],
    features: "分组管理  ·  自动规则  ·  情景切换"
  },
  en: {
    hero: ["Get your extensions", "organized."],
    sub: ["Find, group and switch extensions", "from one convenient panel."],
    chips: ["Groups", "Quick toggles", "List / Grid"],
    titles: [
      "Let your rules do the switching",
      "A profile for every task",
      "Share your extension collection",
      "Keep track of what changed"
    ],
    subtitles: [
      "Automatically enable or disable by URL, profile, operating system or time period.",
      "Create rules for work, study and downtime. Switch profiles as your tasks change.",
      "Export your collection as text, JSON or Markdown — ready to save and share.",
      "Review installs, updates, removals and switches in one place."
    ],
    labels: ["AUTOMATIC RULES", "PROFILES", "SHARE COLLECTIONS", "ACTIVITY HISTORY"],
    small: "Your extensions, under control",
    promo: ["Your extensions,", "under control."],
    features: "Groups  ·  Rules  ·  Profiles"
  }
}

for (const locale of ["zh-CN", "en"]) {
  const c = copy[locale]
  let body =
    rect(0, 0, 1280, 800, "url(#bg)") +
    `<circle cx="1080" cy="300" r="350" fill="#e3eaff"/>` +
    brand()
  body += text("01 / 05", 1150, 56, 15, "#7783a0", 600)
  body += text(
    locale === "zh-CN" ? "你的扩展管理面板" : "YOUR EXTENSION TOOLKIT",
    52,
    163,
    17,
    blue,
    700
  )
  body += lines(c.hero, 52, 245, locale === "en" ? 43 : 54)
  body += lines(c.sub, 52, 416, locale === "en" ? 20 : 24, "#59677d", 400, 1.55)
  c.chips.forEach((s, i) => {
    body +=
      rect(52, 525 + i * 49, locale === "en" ? 163 : 154, 34, "#e6ecfb", 17) +
      text(s, 69, 549 + i * 49, 17, blue, 600)
  })
  body += card(485, 107, 405, 641) + card(918, 326, 310, 227)
  body += text(locale === "zh-CN" ? "网格视图" : "GRID VIEW", 930, 309, 18, blue, 600)
  const list = await raw(locale, "popup-list", 403, 639)
  const grid = await raw(locale, "popup-grid", 308, 225)
  let main = sharp(svg(1280, 800, body)).composite([
    { input: list, left: 486, top: 108 },
    { input: grid, left: 919, top: 327 }
  ])
  await save(`screenshots/${locale}/01-organize.png`, main, "screenshot", locale)
  for (const [i, name] of ["rule", "scene", "share", "history"].entries()) {
    let b = rect(0, 0, 1280, 800, "url(#bg)") + brand()
    b += text(`0${i + 2} / 05`, 1150, 56, 15, "#7783a0", 600)
    b += text(c.titles[i], 52, 132, locale === "en" ? 43 : 47, ink, 700)
    b += text(c.subtitles[i], 54, 181, locale === "en" ? 21 : 23, "#59677d")
    b += card(52, 215, 1176, 551)
    const shot = await raw(locale, name, 1174, 549)
    const layers = [{ input: shot, left: 53, top: 216 }]
    if (name === "rule") {
      const detail = await sharp(resolve(root, `raw/${locale}/rule-editor.png`))
        .extract({ left: 0, top: 0, width: 1078, height: 249 })
        .resize(842, 194)
        .png()
        .toBuffer()
      const overlay =
        text(
          locale === "zh-CN" ? "规则编辑 · URL 匹配" : "RULE EDITOR · URL MATCHING",
          690,
          540,
          17,
          blue,
          600
        ) + card(298, 553, 844, 196, 5)
      layers.push(
        { input: svg(1280, 800, overlay), left: 0, top: 0 },
        { input: detail, left: 299, top: 554 }
      )
    }
    if (name === "scene") {
      const menu = await sharp(resolve(root, `raw/${locale}/popup-scenes.png`))
        .extract({ left: 0, top: 0, width: 960, height: 360 })
        .resize(348, 131)
        .png()
        .toBuffer()
      const overlay =
        text(
          locale === "zh-CN" ? "在弹窗中快速切换" : "Switch from the popup",
          846,
          293,
          18,
          blue,
          600
        ) + card(841, 313, 350, 133)
      layers.push(
        { input: svg(1280, 800, overlay), left: 0, top: 0 },
        { input: menu, left: 842, top: 314 }
      )
    }
    await save(
      `screenshots/${locale}/0${i + 2}-${name}.png`,
      sharp(svg(1280, 800, b)).composite(layers),
      "screenshot",
      locale
    )
  }
}

for (const locale of ["global", "zh-CN", "en"]) {
  const c = copy[locale] || copy.en
  // Separate compositions at each size retain readable type in the small tile.
  const smBg = await sharp(art)
    .resize(700, 280)
    .extract({ left: 0, top: 0, width: 440, height: 280 })
    .toBuffer()
  let sm = rect(0, 0, 440, 280, "#233fc3", 0, 'opacity=".12"') + logo(31, 29, 57, true)
  sm += lines(["Extension", "Manager"], 31, 133, 43, "#fff", 700, 1.15)
  if (locale !== "global") sm += text(c.small, 32, 240, locale === "en" ? 18 : 21, "#eef3ff", 500)
  else
    sm += `<g transform="translate(275 215)">${rect(0, 0, 102, 34, "#a9c0ff", 17)}<circle cx="83" cy="17" r="12" fill="#fff"/></g>`
  await save(
    `promos/${locale}/small-440x280.png`,
    sharp(smBg).composite([{ input: svg(440, 280, sm) }]),
    "small-promo",
    locale
  )
  const largeBg = await sharp(art).resize(1400, 560, { fit: "cover" }).toBuffer()
  let lg = logo(62, 55, 46, true) + text("Extension Manager", 126, 88, 31, "#fff", 600)
  if (locale === "global") {
    lg += lines(["Extension", "Manager"], 62, 247, 78, "#fff", 700, 1.13)
    lg += `<g transform="translate(65 422)">${rect(0, 0, 138, 48, "#a9c0ff", 24)}<circle cx="112" cy="24" r="18" fill="#fff"/>${rect(160, 0, 138, 48, "#547de3", 24)}<circle cx="184" cy="24" r="18" fill="#c8d7ff"/></g>`
  } else {
    lg += lines(c.promo, 62, 235, locale === "en" ? 60 : 68, "#fff", 700, 1.17)
    lg += text(c.features, 65, 415, 26, "#e7eeff", 500)
  }
  const largeLayers = []
  if (locale !== "global") {
    // Real popup detail adds product recognition; universal artwork stays language-independent.
    lg += card(836, 88, 266, 420)
    largeLayers.push({ input: await raw(locale, "popup-list", 264, 418), left: 837, top: 89 })
  }
  const large = sharp(largeBg).composite([{ input: svg(1400, 560, lg) }, ...largeLayers])
  await save(`promos/${locale}/marquee-1400x560.png`, large, "marquee-promo", locale)
}

await writeFile(
  resolve(root, "manifest.json"),
  JSON.stringify(
    { uiSource: "Local repository UI (unreleased)", demoData: true, assets: manifest },
    null,
    2
  ) + "\n"
)
// Two-page contact sheets avoid shrinking five screenshots to unreadable postage stamps.
for (const locale of ["zh-CN", "en"]) {
  let sheet =
    rect(0, 0, 1360, 2310, "#eaf0f8") + text(`Extension Manager — ${locale}`, 40, 60, 32, ink, 700)
  const layers = []
  for (let n = 0; n < 5; n++) {
    const item = manifest.find(
      (a) => a.locale === locale && a.category === "screenshot" && a.file.includes(`/0${n + 1}-`)
    )
    layers.push({
      input: await sharp(resolve(root, item.file)).resize(640, 400).png().toBuffer(),
      left: n % 2 ? 680 : 24,
      top: 110 + Math.floor(n / 2) * 430
    })
  }
  const row = await sharp(resolve(root, `promos/${locale}/marquee-1400x560.png`))
    .resize(1280, 512)
    .png()
    .toBuffer()
  layers.push({ input: row, left: 40, top: 1440 })
  layers.push({
    input: await sharp(resolve(root, `promos/${locale}/small-440x280.png`)).toBuffer(),
    left: 40,
    top: 1980
  })
  await sharp(svg(1360, 2310, sheet))
    .composite(layers)
    .removeAlpha()
    .png()
    .toFile(resolve(root, `preview-${locale}.png`))
}
console.log(`Verified and rendered ${manifest.length} upload assets.`)
