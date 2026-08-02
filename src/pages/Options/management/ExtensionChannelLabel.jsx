import React, { memo } from "react"

import classNames from "classnames"
import styled from "styled-components"

import { isEdgeRuntime } from ".../utils/channelHelper"

/**
 * 标记扩展的来源渠道
 */
const ExtensionChannelLabel = memo(({ channel }) => {
  if (!channel) {
    return null
  }

  if (!isEdgeRuntime() && channel === "Chrome") {
    return null
  }

  let text = channel
  if (channel === "Development") {
    text = "Dev"
  }

  return (
    <Style>
      <span className={classNames(["column-name-channel", `column-name-channel-${channel}`])}>
        {text}
      </span>
    </Style>
  )
})

export default ExtensionChannelLabel

const Style = styled.span`
  .column-name-channel {
    position: relative;
    left: 8px;

    padding: 1px 5px;
    font-size: 12px;
    border-radius: 5px;
    color: ${(props) => props.theme.success};
    background-color: ${(props) => props.theme.success_soft};
  }

  .column-name-channel-Edge {
    color: ${(props) => props.theme.primary};
    background-color: ${(props) => props.theme.primary_soft};
  }

  .column-name-channel-Chrome {
    color: ${(props) => props.theme.warning};
    background-color: ${(props) => props.theme.warning_soft};
  }

  .column-name-channel-Development {
    color: ${(props) => props.theme.danger};
    background-color: ${(props) => props.theme.danger_soft};
  }
`
