import chromeP from "webext-polyfill-kinda"

/**
 * 判断当前状态（情景模式，当前 URL）是否与指定规则匹配
 * @param scene 当前的情景模式
 * @param tabInfo 当前标签页的信息
 * @param rule 规则数据
 */
function isMatch(scene: config.IScene | undefined, tabInfo: chrome.tabs.Tab | undefined, rule: rule.IRuleConfig): boolean {
  const matchMode = rule.match?.matchMode
  const matchMethod = rule.match?.matchMethod
  if (!matchMode) {
    return false
  }

  if (matchMode === "host") {
    return isMatchUrl(tabInfo?.url, rule.match.matchHost, matchMethod)
  } else if (matchMode === "scene") {
    return isMatchScene(scene, rule.match.matchScene)
  }

  return false
}

function isMatchUrl(url: string | undefined, hosts: string[] | undefined, matchMethod: rule.MatchMethod): boolean {
  if (!url || url === "") return false
  if (!hosts || hosts.length === 0) return false

  const host = new URL(url).hostname

  if (matchMethod === "wildcard") {
    const exist = hosts.find((h) => isMatchByWildcard(host, h))
    return Boolean(exist)
  } else if (matchMethod === "regex") {
    const exist = hosts.find((h) => isMatchByRegex(host, h))
    return Boolean(exist)
  }

  return false
}

function isMatchByWildcard(text: string, pattern: string) {
  // [LeetCode44.通配符匹配 JavaScript - 个人文章 - SegmentFault 思否](https://segmentfault.com/a/1190000019486910 )
  let dp = []
  for (let i = 0; i <= text.length; i++) {
    let child = []
    for (let j = 0; j <= pattern.length; j++) {
      child.push(false)
    }
    dp.push(child)
  }
  dp[text.length][pattern.length] = true
  for (let i = pattern.length - 1; i >= 0; i--) {
    if (pattern[i] !== "*") break
    else dp[text.length][i] = true
  }

  for (let i = text.length - 1; i >= 0; i--) {
    for (let j = pattern.length - 1; j >= 0; j--) {
      if (text[i] === pattern[j] || pattern[j] === "?") {
        dp[i][j] = dp[i + 1][j + 1]
      } else if (pattern[j] === "*") {
        dp[i][j] = dp[i + 1][j] || dp[i][j + 1]
      } else {
        dp[i][j] = false
      }
    }
  }
  return dp[0][0]
}

function isMatchByRegex(text: string, pattern: string) {
  const regex = new RegExp(pattern, "i")
  return regex.test(text)
}

function isMatchScene(scene: config.IScene | undefined, sceneId: string | undefined) {
  if (!scene?.id) {
    return false
  }
  return scene.id === sceneId
}

type AdvanceMatchType = {
  /**
   * 当前 TAB 的 URL 是否匹配
  */
  currentTabMatch: boolean,

  /**
   * 所有打开的 TAB 中，是否有任一一个匹配
  */
  anyTabMatch: boolean
}

/**
 * 获取当前 TAB 的高级匹配结果
*/
export async function getAdvanceMatchType(currentUrl: string | undefined, rule: rule.IRuleConfig): Promise<AdvanceMatchType> {
  const matchMethod = rule.match?.matchMethod
  const currentUrlMatch = isMatchUrl(currentUrl, rule.match.matchHost, matchMethod)
  if (currentUrlMatch) {
    return {
      currentTabMatch: true,
      anyTabMatch: true
    }
  }

  const tabs = await chromeP.tabs.query({})
  const anyUrlMatch = tabs.findIndex(tab => isMatchUrl(tab.url, rule.match.matchHost, matchMethod)) > -1

  return {
    currentTabMatch: currentUrlMatch,
    anyTabMatch: anyUrlMatch
  }
}

export default isMatch

