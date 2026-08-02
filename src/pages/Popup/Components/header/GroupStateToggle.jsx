import React, { memo } from "react"

import { Tooltip } from "antd"
import classNames from "classnames"
import { styled } from "styled-components"

import { getLang } from ".../utils/utils"

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
      <TooltipTarget onClick={stopPropagation} onMouseDown={stopPropagation}>
        <ToggleButton
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
        </ToggleButton>
      </TooltipTarget>
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
    background: #bfbfbf;
  }

  .state-dot.state-mixed {
    background: #faad14;
  }

  .state-dot.state-on {
    background: #1677ff;
  }
`

const TooltipTarget = styled.span`
  display: inline-flex;
  flex: none;
  padding: 2px 0;
`

const ToggleButton = styled.button`
  position: relative;
  width: 42px;
  height: 20px;
  padding: 0;
  border: 0;
  border-radius: 10px;
  background: #bfbfbf;
  cursor: pointer;
  transition: background 0.2s ease;

  .thumb {
    position: absolute;
    top: 2px;
    left: 2px;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #fff;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
    transition: left 0.2s ease;
  }

  &.state-on {
    background: #1677ff;

    .thumb {
      left: 24px;
    }
  }

  &.state-mixed {
    background: #faad14;

    .thumb {
      left: 13px;
    }
  }

  &.state-empty {
    background: #d9d9d9;
  }

  &.loading {
    opacity: 0.55;
    cursor: wait;
  }

  &:disabled {
    cursor: not-allowed;
  }

  &:focus-visible {
    outline: 2px solid #1677ff;
    outline-offset: 2px;
  }
`
