import React, { memo, useCallback, useState } from "react"

import styled from "styled-components"

import { usePopupExtensionsByGroup } from "../../utils/usePopupExtensionsByGroup"
import ExtensionGridItem from "./ExtensionGridItem"
import { GridViewSpaceStyle } from "./ExtensionGridView"

const ExtensionGridViewByGroup = memo(({ extensions, options, isShowBottomDivider }) => {
  const [moved, setMoved] = useState("") // 没有业务意义，就是一个依赖值，值发生变化，则重新执行 usePopupExtensions

  const [groups] = usePopupExtensionsByGroup(extensions, options, moved)

  const onItemMove = useCallback((item) => {
    setMoved(Date.now().toString())
  }, [])

  return (
    <GridViewSpaceStyle>
      {groups.map((group) => {
        return (
          <ExtensionGridSpace
            group={group}
            options={options}
            key={group.id}
            onItemMove={onItemMove}></ExtensionGridSpace>
        )
      })}
      {isShowBottomDivider && <div className="divider"></div>}
    </GridViewSpaceStyle>
  )
})

export default ExtensionGridViewByGroup

const ExtensionGridSpace = memo(({ group, options, onItemMove }) => {
  return (
    <GridSpaceByGroupStyle>
      {group.name && <span className="group-name">{group.name}</span>}
      <ul>
        {group.extensions.map((item) => (
          <li key={item.id}>
            <ExtensionGridItem
              item={item}
              enabled={item.enabled}
              options={options}
              onItemMove={onItemMove}
            />
          </li>
        ))}
        {new Array(10).fill("").map((_, index) => (
          <i key={index}></i>
        ))}
      </ul>
    </GridSpaceByGroupStyle>
  )
})

const GridSpaceByGroupStyle = styled.div`
  .group-name {
    display: flex;

    margin: 0 8px;

    &::before,
    &::after {
      border-bottom: 1px solid ${(props) => props.theme.input_border};
    }

    &::before {
      content: "";
      width: 20px;
      margin: auto 8px auto 0;
    }

    &::after {
      content: "";
      flex: 1 1;
      margin: auto 0 auto 8px;
    }
  }
`
