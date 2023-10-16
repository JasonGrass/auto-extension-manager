import _ from "lodash"
import LZString from "lz-string"

/**
 * 解析扩展导入输入的字符串，尝试解析 json 和 分享文本两种格式，返回 extension 数组
 */
export function parse(content) {
  let array = []

  try {
    array = parseJson(content)
    if (array) {
      return array
    }
  } catch (error) {}

  try {
    array = parseShareText(content)
    if (array) {
      return array
    }
  } catch (error) {}

  return null
}

function parseJson(content) {
  try {
    let array = JSON.parse(content)
    array = Array.isArray(array) ? array : null

    if (!array) {
      return null
    }
    if (array.length === 0) {
      return null
    }

    if (typeof array[0] !== "object") {
      return null
    }

    return array
  } catch (error) {
    return null
  }
}

function parseShareText(content) {
  if (!content || content.length < 1) {
    return null
  }

  let index = content.indexOf("--BEGIN--")
  if (index < 0) {
    return null
  }

  let text = content.substring(index + 13)
  index = text.indexOf("--END--")
  if (index < 0) {
    return null
  }
  text = text.substring(0, index)
  text = _.trim(text, "-")
  text = text.trim()

  text = LZString.decompressFromBase64(text)

  const array = text
    .split("##<#")
    .map((line) => {
      if (!line) {
        return null
      }

      const items = line.split("#><#").map((i) => {
        return _.trim(i, "#>")
      })

      if (items.length < 3) {
        return null
      }

      return {
        id: items[0],
        name: items[1],
        channel: items[2],
        alias: items[3],
        remark: items[4]
      }
    })
    .filter(Boolean)

  return array
}
