import LZString from "lz-string"

export function buildShareText(extensions, exportRange, targetExtensionIds) {
  const target = extensions.filter((ext) => targetExtensionIds.includes(ext.id))
  const content = target.map((ext) => {
    // Fixed positions also let older importers read remark-only exports correctly.
    const fields = [
      ext.id,
      ext.name,
      ext.channel,
      exportRange.includes("alias") ? ext.alias || "" : "",
      exportRange.includes("remark") ? ext.remark || "" : ""
    ]
    return "##" + fields.map((field) => `<#${field}#>`).join("")
  })
  return [LZString.compressToBase64(content.join("")), target.length]
}
