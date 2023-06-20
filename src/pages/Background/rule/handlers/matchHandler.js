function isMatch(scene, tabInfo, rule) {
  const matchMode = rule.match?.matchMode
  const matchMethod = rule.match?.matchMethod
  if (!matchMode) {
    return false
  }

  if (matchMode === "host") {
    return isMatchUrl(tabInfo.url, rule.match.matchHost, matchMethod)
  } else if (matchMode === "scene") {
    return isMatchScene(scene, rule.match.matchScene)
  }

  return false
}

function isMatchUrl(url, hosts, matchMethod) {
  if (!url || url === "") return false
  if (!hosts || hosts.length === 0) return false

  const host = new URL(url).hostname

  if (matchMethod === "wildcard") {
    const exist = hosts.find((h) => isMatchByWildcard(host, h))
    return !!exist
  } else if (matchMethod === "regex") {
    const exist = hosts.find((h) => isMatchByRegex(host, h))
    return !!exist
  }
}

function isMatchByWildcard(text, pattern) {
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

function isMatchByRegex(text, pattern) {
  const regex = new RegExp(pattern, "i")
  return regex.test(text)
}

function isMatchScene(scene, sceneId) {
  if (!scene?.id) {
    return false
  }
  return scene.id === sceneId
}

export default isMatch
