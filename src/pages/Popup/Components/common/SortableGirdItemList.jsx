import React, { memo, useEffect, useState } from "react"

import { nanoid } from "nanoid"
import styled from "styled-components"

import { SortableList } from ".../pages/Options/components/SortableList"

const SortableGirdItemList = memo(({ extensions, renderItem }) => {
  const itemsWithEmpty = [
    ...extensions,
    ...new Array(10).fill({}).map((i) => {
      return { id: nanoid(), isEmpty: true }
    })
  ]

  const [items, setItems] = useState(itemsWithEmpty)

  useEffect(() => {
    setItems([
      ...extensions,
      ...new Array(10).fill({}).map((i) => {
        return { id: nanoid(), isEmpty: true }
      })
    ])
  }, [extensions])

  const handleGridItemDropEnd = (updatedList) => {
    setItems(updatedList)
  }

  return (
    <Style>
      <SortableList
        items={items}
        onChange={handleGridItemDropEnd}
        renderItem={(item, index) => {
          if (item.isEmpty) {
            return <i key={item.id}></i>
          } else {
            return <SortableList.Item id={item.id}>{renderItem(item, index)}</SortableList.Item>
          }
        }}></SortableList>
    </Style>
  )
})

export default SortableGirdItemList

SortableGirdItemList.displayName = "SortableGirdItemList"

const Style = styled.div`
  .SortableList {
    gap: 0;
  }

  .SortableItem {
    display: list-item;

    margin: 12px 16px;
    padding: 0;
    background-color: transparent;
    box-shadow: none;
    border: none;
  }
`
