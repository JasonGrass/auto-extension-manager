import React, { memo } from "react"

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
      return `${hosts[0]} 等 ${hosts.length} 条`
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
      return <h3>{scene.name}</h3>
    }
  }

  return <div>MatchView</div>
})

export default MatchView
