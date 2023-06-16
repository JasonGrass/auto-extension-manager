import React, { memo } from "react"

import { styled } from "styled-components"

const MatchView = memo(({ config, sceneOption }) => {
  console.log("sceneOption", sceneOption)

  if (!config || !config.matchMode) {
    return <p>ERROR</p>
  }

  if (config.matchMode === "host") {
    const hosts = config.matchHost
    if (!hosts || hosts.length === 0) {
      return <p>ERROR</p>
    }

    if (hosts.length === 1) {
      return hosts[0]
    } else {
      return (
        <Style>
          <span>
            {hosts[0]} 等 {hosts.length} 条
          </span>
        </Style>
      )
    }
  }

  if (config.matchMode === "scene") {
    if (!config.matchScene) {
      return <p>ERROR</p>
    }

    const scene = sceneOption.filter((s) => s.id === config.matchScene)[0]
    if (!scene) {
      return <p>ERROR</p>
    } else {
      return (
        <Style>
          <span>{scene.name}</span>
        </Style>
      )
    }
  }

  return <div>ERROR</div>
})

export default MatchView

const Style = styled.div``
