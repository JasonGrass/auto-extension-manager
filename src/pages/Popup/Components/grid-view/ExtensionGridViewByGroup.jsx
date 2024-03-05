import React, { memo, useCallback, useState } from "react"

import classNames from "classnames"
import styled from "styled-components"

import { usePopupExtensionsByGroup } from "../../utils/usePopupExtensionsByGroup"
import FoldGroupName from "../common/FoldGroupName"
import SortableGirdItemList from "../common/SortableGirdItemList"
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
      {groups
        .filter((g) => g.extensions.length > 0)
        .map((group, index) => {
          return (
            <ExtensionGridSpace
              group={group}
              options={options}
              key={group.id}
              onItemMove={onItemMove}
              groupIndex={index}></ExtensionGridSpace>
          )
        })}
      {isShowBottomDivider && <div className="divider"></div>}
    </GridViewSpaceStyle>
  )
})

export default ExtensionGridViewByGroup

const ExtensionGridSpace = memo(({ group, options, onItemMove, groupIndex }) => {
  // 是否折叠分组显示
  const [fold, setFold] = useState(false)

  const onFoldChanged = useCallback((fold) => {
    setFold(fold)
  }, [])

  return (
    <GridSpaceByGroupStyle>
      {group.name && (
        <span className={classNames(["group-name", { "group-name-top": groupIndex === 0 }])}>
          <FoldGroupName group={group} onFoldChanged={onFoldChanged}></FoldGroupName>
        </span>
      )}

      <ul className={classNames({ "show-list": !fold, "hide-list": fold })}>
        <SortableGirdItemList
          extensions={group.extensions}
          renderItem={(item, index) => {
            return (
              <ExtensionGridItem
                item={item}
                enabled={item.enabled}
                options={options}
                onItemMove={onItemMove}
              />
            )
          }}></SortableGirdItemList>
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
