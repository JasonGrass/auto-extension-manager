import React, { memo } from "react"

import { styled } from "styled-components"

import { getIcon } from ".../utils/extensionHelper.js"

const ExtensionGridItem = memo(({ item, options }) => {
  return (
    <Style>
      <div>
        <img src={getIcon(item, 48)} alt="icon" />
      </div>
    </Style>
  )
})

export default ExtensionGridItem

const Style = styled.div`
  transition: transform 0.3s ease;

  img {
    width: 42px;
    height: 42px;
  }

  &:hover {
    transform: scale(1.2);
  }
`
