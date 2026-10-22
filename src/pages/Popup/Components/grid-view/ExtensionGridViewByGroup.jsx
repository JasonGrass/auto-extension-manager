import React, { memo, useCallback, useState } from "react"

import classNames from "classnames"
import styled from "styled-components"

import { usePopupExtensionsByGroup } from "../../utils/usePopupExtensionsByGroup"
import FoldGroupName from "../common/FoldGroupName"
import ExtensionGridItem from "./ExtensionGridItem"
import { GridViewSpaceStyle } from "./ExtensionGridView"

const ExtensionGridViewByGroup = memo(
  ({ extensions, options, initialFoldedGroups = {}, isShowBottomDivider }) => {
    const [moved, setMoved] = useState("") // 没有业务意义，就是一个依赖值，值发生变化，则重新执行 usePopupExtensions

    const [groups] = usePopupExtensionsByGroup(extensions, options, moved)

    const onItemMove = useCallback(
      (item) => {
        if (options.setting.isRefreshAfterEnableDisable ?? true) {
          setMoved(Date.now().toString())
        }
      },
      [options]
    )

    return (
      <GridViewSpaceStyle>
        {groups
          .filter((g) => g.extensions.length > 0)
          .map((group, index) => {
            return (
              <ExtensionGridSpace
                group={group}
                initialFolded={Boolean(group.name && initialFoldedGroups[group.id])}
                options={options}
                key={group.id}
                onItemMove={onItemMove}
                groupIndex={index}></ExtensionGridSpace>
            )
          })}
        {isShowBottomDivider && <div className="divider"></div>}
      </GridViewSpaceStyle>
    )
  }
)

export default ExtensionGridViewByGroup

const ExtensionGridSpace = memo(({ group, initialFolded, options, onItemMove, groupIndex }) => {
  // 是否折叠分组显示
  const [fold, setFold] = useState(initialFolded)
  // ponytail: retain expanded rows for collapse animation; unmount only if memory warrants it.
  const [hasExpanded, setHasExpanded] = useState(!initialFolded)

  const onFoldChanged = useCallback((fold) => {
    setFold(fold)
    if (!fold) setHasExpanded(true)
  }, [])

  return (
    <GridSpaceByGroupStyle>
      {group.name && (
        <span className={classNames(["group-name", { "group-name-top": groupIndex === 0 }])}>
          <FoldGroupName
            group={group}
            initialFolded={initialFolded}
            onFoldChanged={onFoldChanged}></FoldGroupName>
        </span>
      )}

      <ul className={classNames({ "show-list": !fold, "hide-list": fold })}>
        {hasExpanded &&
          group.extensions.map((item) => (
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
    user-select: none;

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

  .show-list {
    opacity: 1;
    max-height: 600px;
    transition: all 0.4s;
  }

  .hide-list {
    overflow: hidden;
    opacity: 0;
    max-height: 16px;
    transition: all 0.4s;
  }

  .group-name-top {
    margin-top: 6px;
  }
`
