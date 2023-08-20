import React, { memo, useEffect, useState } from "react"

import classNames from "classnames"
import { styled } from "styled-components"

import { appendAdditionInfo, sortExtension } from ".../utils/extensionHelper"
import ExtensionGridItem from "./ExtensionGridItem"

const ExtensionGrid = memo(({ extensions, options }) => {
  const [items1, setItems1] = useState([])
  const [items2, setItems2] = useState([])

  useEffect(() => {
    const list = appendAdditionInfo(extensions, options)
    const list1 = list.filter((i) => i.enabled)
    const list2 = list.filter((i) => !i.enabled)
    setItems1(sortExtension(list1))
    setItems2(sortExtension(list2))
  }, [extensions, options])

  return (
    <Style>
      <ul>
        {items1.map((item) => {
          return (
            <li key={item.id} className="grid-item-enable">
              <ExtensionGridItem item={item} options={options}></ExtensionGridItem>
            </li>
          )
        })}
        {new Array(10).fill("").map(() => (
          <i></i>
        ))}
      </ul>
      {items2.length > 0 && <div className="divider"></div>}
      <ul>
        {items2.map((item) => {
          return (
            <li key={item.id} className="grid-item-disable">
              <ExtensionGridItem item={item} options={options}></ExtensionGridItem>
            </li>
          )
        })}
        {new Array(10).fill("").map(() => (
          <i></i>
        ))}
      </ul>
      <div className="divider"></div>
    </Style>
  )
})

export default ExtensionGrid
const Style = styled.div`
  margin-top: 10px;

  ul {
    display: flex;
    justify-content: space-between;
    align-content: flex-start;
    flex-wrap: wrap;

    li {
      width: 42px;
      height: 42px;

      margin: 12px 10px;
    }

    i {
      width: 42px;
      margin: 0px 10px;
    }
  }

  .divider {
    height: 1px;
    background-color: #ccc;
    margin: 0px 10px 10px 10px;
  }

  .grid-item-disable {
    filter: grayscale(100%) opacity(50%);

    &:hover {
      filter: none;
    }
  }
`
