/*
scene
{
    "id": "kxfWE08kilHHz9u-dMi1z"
}

tabInfo
{
    "url": "https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Classes/Private_class_fields",
    "title": "类私有域 - JavaScript | MDN",
    "windowId": 976470013,
    "id": 976470232
}

rules
[
    {
        "match": {
            "matchMode": "host",
            "matchMethod": "wildcard",
            "matchHost": [
                "*www.baidu.com*",
                "bbbbbbbb"
            ]
        },
        "target": {
            "targetType": "group",
            "targetGroup": "r2S7BwNH_Mwg6TpV5QfAr",
            "targetExtensions": []
        },
        "action": {
            "actionType": "openWhenMatched"
        },
        "id": "uByyto6rdrqzxftdGqznN"
    }
]

groups
[
    {
        "name": "开发调试",
        "desc": "开发调试工具",
        "id": "r2S7BwNH_Mwg6TpV5QfAr",
        "extensions": [
            "bcjindcccaagfpapjjmafapmmgkkhgoa"
        ]
    }
]
*/
import isMatch from "./handlers/matchHandler"
import getTarget from "./handlers/targetHandler"

/**
 * 根据当前情景模式，标签页信息，规则信息，处理扩展的打开或关闭
 */
function precessRule({ scene, tabInfo, rules, groups }) {
  console.log("precessRule")

  console.log(scene)
  console.log(tabInfo)
  console.log(rules)
  console.log(groups)

  for (let i = 0; i < rules.length; i++) {
    precess(rules[i], scene, tabInfo, groups)
  }
}

function precess(rule, scene, tabInfo, groups) {
  if (!isMatch(scene, tabInfo, rule)) {
    return
  }

  const targetIdArray = getTarget(groups, rule)
  if (!targetIdArray || targetIdArray.length === 0) {
    return
  }

  console.log("targetIdArray", targetIdArray)
}

export default precessRule
