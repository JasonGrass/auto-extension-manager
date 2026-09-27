import { readFile, writeFile } from "node:fs/promises"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import assert from "node:assert/strict"

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const manifest = JSON.parse(await readFile(resolve(root, "manifest.json"), "utf8"))
assert.equal(manifest.assets.length, 16, "Expected 10 screenshots and 6 promo tiles")
assert.equal(new Set(manifest.assets.map((a) => a.file)).size, 16, "Duplicate filenames")
const results = []
for (const asset of manifest.assets) {
  const data = await readFile(resolve(root, asset.file))
  assert.deepEqual([...data.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10])
  const size =
    asset.category === "screenshot"
      ? [1280, 800]
      : asset.category === "small-promo"
        ? [440, 280]
        : [1400, 560]
  assert.equal(data.readUInt32BE(16), size[0], asset.file)
  assert.equal(data.readUInt32BE(20), size[1], asset.file)
  assert.equal(data[24], 8, "PNG must have 8 bits per RGB channel")
  assert.equal(data[25], 2, "PNG must be RGB, not RGBA or indexed")
  for (let p = 8; p < data.length;) {
    assert.notEqual(
      data.toString("ascii", p + 4, p + 8),
      "tRNS",
      `${asset.file}: transparent color chunk`
    )
    p += 12 + data.readUInt32BE(p)
  }
  results.push({
    file: asset.file,
    width: size[0],
    height: size[1],
    color: "24-bit RGB PNG",
    alpha: false,
    bytes: data.length
  })
}
for (const locale of ["zh-CN", "en"])
  assert.equal(results.filter((a) => a.file.startsWith(`screenshots/${locale}/`)).length, 5)
for (const locale of ["global", "zh-CN", "en"]) {
  for (const category of ["small-promo", "marquee-promo"]) {
    assert.equal(
      manifest.assets.filter((a) => a.locale === locale && a.category === category).length,
      1,
      `${locale} ${category}`
    )
  }
}
await writeFile(
  resolve(root, "verification.json"),
  JSON.stringify(
    { checkedAt: new Date().toISOString(), passed: true, count: results.length, results },
    null,
    2
  ) + "\n"
)
console.log(`PASS: ${results.length} PNGs; exact dimensions, 24-bit RGB, no alpha or tRNS.`)
