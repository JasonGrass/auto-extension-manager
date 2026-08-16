import React, { memo } from "react"

import { Tooltip } from "antd"
import classNames from "classnames"
import { styled } from "styled-components"

import { getLang } from ".../utils/utils"
import { StateToggleButton, StateToggleTarget } from "./StateToggleStyle"

const tooltipStyles = {
  root: {
    maxWidth: 300
  },
  container: {
    padding: "8px 8px 8px 10px"
  }
}

const GroupStateToggle = memo(({ state, loading, onChange, groupName }) => {
  const disabled = state === "empty" || loading
  const emptyTooltip = getLang("popup_group_toggle_empty_tip")
  const stateTips = {
    off: getLang("popup_group_toggle_off_state_tip"),
    mixed: getLang("popup_group_toggle_mixed_state_tip"),
    on: getLang("popup_group_toggle_on_state_tip")
  }
  const summary = getLang("popup_group_toggle_tip")
  const ariaDescription =
    state === "empty" ? emptyTooltip : [summary, ...Object.values(stateTips)].join(" ")
  const tooltip =
    state === "empty" ? (
      emptyTooltip
    ) : (
      <TooltipContent>
        <div className="summary">{summary}</div>
        {Object.entries(stateTips).map(([itemState, tip]) => (
          <div
            key={itemState}
            className={classNames("state-description", { current: state === itemState })}>
            <span className={`state-dot state-${itemState}`} />
            <span>{tip}</span>
          </div>
        ))}
      </TooltipContent>
    )

  const stopPropagation = (event) => {
    event.stopPropagation()
  }

  const handleClick = (event) => {
    event.stopPropagation()
    if (disabled) {
      return
    }

    if (state === "mixed") {
      const rect = event.currentTarget.getBoundingClientRect()
      onChange(event.clientX >= rect.left + rect.width / 2)
      return
    }

    onChange(state !== "on")
  }

  const handleKeyDown = (event) => {
    if (disabled) {
      return
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault()
      event.stopPropagation()
      onChange(false)
    } else if (event.key === "ArrowRight") {
      event.preventDefault()
      event.stopPropagation()
      onChange(true)
    }
  }

  return (
    <Tooltip placement="right" title={tooltip} mouseEnterDelay={1} styles={tooltipStyles}>
      <StateToggleTarget onClick={stopPropagation} onMouseDown={stopPropagation}>
        <StateToggleButton
          type="button"
          role="checkbox"
          aria-checked={state === "mixed" ? "mixed" : state === "on"}
          aria-label={`${groupName}: ${ariaDescription}`}
          disabled={disabled}
          className={classNames(`state-${state}`, { loading })}
          onClick={handleClick}
          onMouseDown={stopPropagation}
          onKeyDown={handleKeyDown}>
          <span className="thumb" />
        </StateToggleButton>
      </StateToggleTarget>
    </Tooltip>
  )
})

export default GroupStateToggle

const TooltipContent = styled.div`
  display: grid;
  gap: 5px;
  width: 260px;

  .summary {
    margin-bottom: 2px;
  }

  .state-description {
    display: flex;
    align-items: flex-start;
    gap: 7px;
    line-height: 1.4;
  }

  .state-description.current {
    font-weight: 600;
  }

  .state-dot {
    flex: none;
    width: 8px;
    height: 8px;
    margin-top: 5px;
    border-radius: 50%;
    background: ${(props) => props.theme.fg6};
  }

  .state-dot.state-mixed {
    background: ${(props) => props.theme.warning};
  }

  .state-dot.state-on {
    background: ${(props) => props.theme.primary};
  }
`
