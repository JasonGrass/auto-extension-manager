import React, { memo } from "react"

import { styled } from "styled-components"

import { PlatformOs } from ".../pages/Options/rule/editor/triggers/OsTrigger/Index"
import { getLang } from ".../utils/utils"

/**
 * 匹配条件的显示
 * @param config 单个规则中，匹配条件的那部分（IMatch）
 * @param options 用户完整的配置项
 */
const MatchView = memo(({ config, options }) => {
  if (!config || !config.triggers || config.triggers.length === 0) {
    return <span className="error-text">ERROR</span>
  }

  const tips = []

  const urlTrigger = config.triggers.find((t) => t.trigger === "urlTrigger")
  if (urlTrigger) {
    if (urlTrigger.config.matchUrl.length === 1) {
      tips.push(urlTrigger.config.matchUrl[0])
    } else {
      const msg = getLang(
        "rule_view_match_url_tip",
        urlTrigger.config.matchUrl[0],
        urlTrigger.config.matchUrl.length
      )
      tips.push(msg)
    }
  }

  const sceneTrigger = config.triggers.find((t) => t.trigger === "sceneTrigger")
  if (sceneTrigger) {
    const sceneId = sceneTrigger.config.sceneId
    const sceneIds = sceneTrigger.config.sceneIds

    if (sceneIds && sceneIds.length > 0) {
      let names = options.scenes?.filter((s) => sceneIds.includes(s.id)).map((s) => s.name) ?? []
      if (names.length > 5) {
        names = names.slice(0, 5)
        names.push("...")
      }
      tips.push(names.join(", "))
    } else {
      const scene = options.scenes?.find((s) => s.id === sceneId)
      if (scene) {
        tips.push(scene.name)
      }
    }
  }

  const osTrigger = config.triggers.find((t) => t.trigger === "osTrigger")
  if (osTrigger) {
    const list = osTrigger.config.os.map(
      (osKey) => PlatformOs.find((p) => p.value === osKey)?.label ?? osKey
    )
    tips.push(list.join(", "))
  }

  const periodTrigger = config.triggers.find((t) => t.trigger === "periodTrigger")
  if (periodTrigger) {
    const list = periodTrigger.config.periods
    tips.push(list.map((period) => period.start + "-" + period.end).join(", "))
  }

  if (tips.length === 0) {
    return <span className="error-text">ERROR</span>
  }

  let message = ""
  if (config.relationship === "and") {
    message = tips.join(" & ")
  } else if (config.relationship === "or") {
    message = tips.join(" | ")
  } else {
    return <span className="error-text">ERROR</span>
  }

  return (
    <Style>
      <span>{message}</span>
    </Style>
  )
})

export default MatchView

const Style = styled.div`
  max-width: 600px;
`
