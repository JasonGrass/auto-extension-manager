import React, { memo } from "react"

import { styled } from "styled-components"

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
      tips.push(`${urlTrigger.config.matchUrl[0]} 等 ${urlTrigger.config.matchUrl.length} 条`)
    }
  }

  const sceneTrigger = config.triggers.find((t) => t.trigger === "sceneTrigger")
  if (sceneTrigger) {
    const scene = options.scenes?.find((s) => s.id === sceneTrigger.config.sceneId)
    if (scene) {
      tips.push(scene.name)
    }
  }

  const osTrigger = config.triggers.find((t) => t.trigger === "osTrigger")
  if (osTrigger) {
    const list = osTrigger.config.os
    tips.push(list.toString)
  }

  if (tips.length === 0) {
    return <span className="error-text">ERROR</span>
  }

  let message = ""
  if (config.relationship === "and") {
    message = tips.join(" && ")
  } else if (config.relationship === "or") {
    message = tips.join(" || ")
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

const Style = styled.div``
