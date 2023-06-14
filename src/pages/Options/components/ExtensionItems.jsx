import React, { memo } from "react"

import classNames from "classnames"
import { styled } from "styled-components"

import { getIcon } from ".../utils/extensionHelper"

const ExtensionItems = memo(({ items, onClick }) => {
  return (
    <Style>
      <ul>
        {items.map((item) => {
          return (
            <li
              key={item.id}
              className={classNames({
                "ext-item": true,
                "not-enable": !item.enabled
              })}
              onClick={(e) => onClick(e, item)}>
              <img src={getIcon(item, 128)} alt="" />
              <span>{item.name}</span>
            </li>
          )
        })}
      </ul>
    </Style>
  )
})

export default ExtensionItems

const Style = styled.div`
  .ext-item {
    margin: 12px 15px;
  }

  .not-enable {
    color: #cccccc;
  }
`
