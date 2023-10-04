import React, { memo, useCallback, useEffect, useState } from "react"

import classNames from "classnames"
import { styled } from "styled-components"

import { usePopupExtensionsByGroup } from "../../utils/usePopupExtensionsByGroup"
import ExtensionListItem from "./ExtensionListItem"

/**
 * 普通扩展的列表展示
 */
const ExtensionListViewByGroup = memo(({ extensions, options }) => {
  const [moved, setMoved] = useState("") // 没有业务意义，就是一个依赖值，值发生变化，则重新执行 usePopupExtensions

  const [groups] = usePopupExtensionsByGroup(extensions, options, moved)

  const onItemEnableChanged = useCallback((item) => {
    setMoved(Date.now().toString())
  }, [])

  return (
    <Style>
      {groups.map((group) => {
        return (
          <ExtensionListSpace
            group={group}
            options={options}
            key={group.id}
            onItemEnableChanged={onItemEnableChanged}></ExtensionListSpace>
        )
      })}
    </Style>
  )
})

export default ExtensionListViewByGroup

const ExtensionListSpace = memo(({ group, options, onItemEnableChanged }) => {
  return (
    <div>
      {group.name && <span className="group-name">{group.name}</span>}
      <ul>
        {group.extensions.map((item) => (
          <li key={item.id}>
            <ExtensionListItem
              item={item}
              enabled={item.enabled}
              options={options}
              onItemEnableChanged={onItemEnableChanged}
            />
          </li>
        ))}
        {new Array(10).fill("").map((_, index) => (
          <i key={index}></i>
        ))}
      </ul>
    </div>
  )
})

const Style = styled.ul`
  li {
    /* border: 1px solid #cccccc55; */
    margin-bottom: 1px;
  }

  li:last-child {
    border-bottom: none;
  }

  .group-name {
    display: flex;

    margin: 12px 8px;

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
