import PinyinMatch from "pinyin-match"

/**
 * 检查目标是否与搜索词匹配
 * @param {Array<string>} target 搜索目标
 * @param {string} search 搜索词
 * @returns {boolean}
 */
export default function isMatch(target, search) {
  if ((!target || target.length < 1) && !search) {
    return true
  }

  if (!search) {
    return false
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
