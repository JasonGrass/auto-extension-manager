import LZString from "lz-string"

function compress(obj) {
  if (!obj) {
    return obj
  }

  if (obj.type === "lz-string-utf16") {
    // 已经压缩过了
    return obj
  }

  var str = JSON.stringify(obj)
  var compressed = LZString.compressToUTF16(str)
  return {
    type: "lz-string-utf16",
    data: compressed
  }
}

function decompress(obj) {
  if (!obj) {
    return obj
  }
  if (obj.type !== "lz-string-utf16") {
    return obj
  }

  var decompressed = LZString.decompressFromUTF16(obj.data)

  const result = JSON.parse(decompressed)
  if (result.type === "lz-string-utf16") {
    // 重复压缩的修复处理
    return decompress(result)
  }

  return result
}

const strCompress = {
  // 压缩
  compress,
  // 解压
  decompress
}

export default strCompress
