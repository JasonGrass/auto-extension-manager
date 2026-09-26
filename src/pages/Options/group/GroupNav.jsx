import React, { useEffect, useState } from "react"

import { PlusOutlined } from "@ant-design/icons"
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd"
import { Button } from "antd"
import classNames from "classnames"

import { getLang } from "../../../utils/utils"
import { GroupNavStyle } from "./GroupNavStyle"
import { AddNewNavItem } from "./helpers"

function GroupNav({ groupInfo, current, onSelectedChanged, onGroupOrdered }) {
  const [groupItems, setGroupItems] = useState([])

  useEffect(() => {
    const hiddenGroup = groupInfo.find((g) => g.id === "hidden")
    if (hiddenGroup) {
      hiddenGroup.name = getLang("group_hidden_name")
      hiddenGroup.desc = getLang("group_hidden_desc")
    }
    const fixedGroup = groupInfo.find((g) => g.id === "fixed")
    if (fixedGroup) {
      fixedGroup.name = getLang("group_fixed_name")
      fixedGroup.desc = getLang("group_fixed_desc")
    }
    setGroupItems(groupInfo.filter(Boolean))
  }, [groupInfo])

  const handleDrop = (droppedItem) => {
    if (!droppedItem.destination) return
    const updatedList = [...groupItems]
    const [reorderedItem] = updatedList.splice(droppedItem.source.index, 1)
    updatedList.splice(droppedItem.destination.index, 0, reorderedItem)
    setGroupItems(updatedList)
    onGroupOrdered?.(updatedList)
  }

  return (
    <GroupNavStyle>
      <DragDropContext onDragEnd={handleDrop}>
        <Droppable droppableId="group-droppable">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {groupItems.map((group, index) => (
                <Draggable
                  key={group.id}
                  draggableId={group.id}
                  index={index}
                  disableInteractiveElementBlocking>
                  {(provided) => (
                    <div
                      className="item-container"
                      ref={provided.innerRef}
                      {...provided.draggableProps}>
                      <button
                        {...provided.dragHandleProps}
                        type="button"
                        className={classNames("tab-container", {
                          "selected-group-item": group.id === current?.id
                        })}
                        aria-pressed={group.id === current?.id}
                        onClick={() => onSelectedChanged?.(group)}>
                        <span title={group.name}>{group.name}</span>
                      </button>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
      <Button
        block
        type="dashed"
        icon={<PlusOutlined />}
        onClick={() => onSelectedChanged?.(AddNewNavItem)}>
        {getLang("group_new")}
      </Button>
    </GroupNavStyle>
  )
}

export default GroupNav
