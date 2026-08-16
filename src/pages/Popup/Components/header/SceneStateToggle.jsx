import React, { memo } from "react"

import { StateToggleButton, StateToggleTarget } from "./StateToggleStyle"

/** Binary scene switch using the same dimensions and colors as the group switch. */
const SceneStateToggle = memo(({ active, loading, onChange, sceneName, ariaLabel }) => {
  const stopPropagation = (event) => {
    // A switch operation must not trigger the surrounding dropdown menu item.
    event.stopPropagation()
  }

  const handleClick = (event) => {
    event.stopPropagation()
    if (!loading) {
      onChange(!active)
    }
  }

  const handleKeyDown = (event) => {
    if (loading) {
      return
    }

    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault()
      event.stopPropagation()
      onChange(event.key === "ArrowRight")
    }
  }

  return (
    <StateToggleTarget onClick={stopPropagation} onMouseDown={stopPropagation}>
      <StateToggleButton
        type="button"
        role="switch"
        aria-checked={active}
        aria-label={ariaLabel ?? sceneName}
        disabled={loading}
        className={`${active ? "state-on" : "state-off"}${loading ? " loading" : ""}`}
        onClick={handleClick}
        onMouseDown={stopPropagation}
        onKeyDown={handleKeyDown}>
        <span className="thumb" />
      </StateToggleButton>
    </StateToggleTarget>
  )
})

export default SceneStateToggle
