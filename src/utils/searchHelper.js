import PinyinMatch from "pinyin-match"

/**
 * 检查目标是否与搜索词匹配
 * @param {Array<string>} target 搜索目标
 * @param {string} search 搜索词
 * @param {boolean} matchWhenSearchEmpty 当搜索词为空时，是否认为匹配（默认 false）
 * @returns {boolean}
 */
export default function isMatch(target, search, matchWhenSearchEmpty = false) {
  if ((!target || target.length < 1) && !search) {
    return true
  }

  if (!search) {
    return matchWhenSearchEmpty
  }

  if (!target || target.length < 1) {
    return false
  }

  for (let i = 0; i < target.length; i++) {
    const targetItem = target[i]
    if (PinyinMatch.match(targetItem, search)) {
      return true
    }
  }

  return false
}

/**
 * 指定扩展是否匹配搜索词
 */
export function isExtensionMatch(ext, search, matchWhenSearchEmpty) {
  const target = [
    ext.name,
    ext.shortName,
    ext.description,
    ext.__attach__?.alias,
    ext.__attach__?.remark
  ]

  return isMatch(target, search, matchWhenSearchEmpty)
}
