import React, { useEffect, useState } from "react"

import { DeleteFilled, EditFilled, PlusOutlined } from "@ant-design/icons"
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd"
import { Popconfirm, message } from "antd"
import classNames from "classnames"

import { GroupOptions, isSpecialGroup } from ".../storage/index"
import { getLang } from "../../../utils/utils"
import { GroupNavStyle } from "./GroupNavStyle"
import { AddNewNavItem } from "./helpers"

function GroupNav({
  groupInfo,
  current,
  onSelectedChanged,
  onGroupItemDeleted,
  onGroupItemEdit,
  onGroupOrdered
}) {
  const [groupItems, setGroupItems] = useState([])

  // 初始化
  useEffect(() => {
    let showGroupItems = []

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

    showGroupItems = [
      fixedGroup,
      hiddenGroup,
      ...groupInfo.filter((g) => !isSpecialGroup(g))
    ].filter(Boolean)

    setGroupItems(showGroupItems)
  }, [groupInfo])

  const onGroupTabClick = (e, item) => {
    onSelectedChanged?.(item)
  }

  const onAddNewGroupClick = (e) => {
    onSelectedChanged?.(AddNewNavItem)
  }

  const onEditGroupClick = (e, group) => {
    e.stopPropagation()
    if (isSpecialGroup(group)) {
      message.warning(getLang("group_inner_cannot_edit"))
      return
    }
    onGroupItemEdit?.(group)
  }

  function selectFirstGroupTab(except) {
    if (!groupInfo) {
      onSelectedChanged?.()
      return
    }

    // 没有排除项，则指定为第一个
    if (!except && groupInfo[0]) {
      onSelectedChanged?.(groupInfo[0])
      return
    }

    // 有排除项，则选择排除项之外的第一个
    if (except) {
      const one = groupInfo.filter((g) => g.id !== except.id)[0]
      if (one) {
        onSelectedChanged?.(one)
        return
      }
    }
    onSelectedChanged?.()
  }

  const onDeleteGroupClick = async (e, group) => {
    e.stopPropagation()

    if (isSpecialGroup(group)) {
      message.warning(getLang("group_inner_cannot_delete"))
      return
    }

    await GroupOptions.deleteGroup(group.id)
    if (group.id === current?.id) {
      selectFirstGroupTab(group)
    }

    onGroupItemDeleted?.(group)

    message.info(`delete ${group.name}`)
  }

  const handleDrop = (droppedItem) => {
    if (!droppedItem.destination) return
    if (droppedItem.droppableId === "fixed") {
      return
    }

    var updatedList = [...groupItems]
    // Remove dragged item
    const [reorderedItem] = updatedList.splice(droppedItem.source.index, 1)
    // Add dropped item
    updatedList.splice(droppedItem.destination.index, 0, reorderedItem)
    // Update State
    setGroupItems(updatedList)

    onGroupOrdered?.(updatedList)
  }

  // 单个 Group Item 的显示
  const buildGroupItemView = (group) => {
    return (
      <div onClick={(e) => onGroupTabClick(e, group)}>
        <div
          className={classNames([
            "tab-container",
            { "selected-group-item": group.id === current?.id }
          ])}>
          <h3>{group.name}</h3>

          {isSpecialGroup(group) || (
            <div className="tab-operation">
              <EditFilled
                onClick={(e) => onEditGroupClick(e, group)}
                className="tab-operation-item"
              />

              <Popconfirm
                className="tab-operation-item"
                title={getLang("group_delete_title")}
                description={getLang("group_delete_confirm", group.name)}
                onConfirm={(e) => onDeleteGroupClick(e, group)}
                onCancel={(e) => e.stopPropagation()}
                okText="Yes"
                cancelText="Cancel"
                onClick={(e) => e.stopPropagation()}>
                <DeleteFilled />
              </Popconfirm>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <GroupNavStyle>
      <DragDropContext onDragEnd={handleDrop}>
        <Droppable droppableId="group-droppable">
          {(provided, snapshot) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {groupItems.map((group, index) => (
                <Draggable
                  key={group.id}
                  draggableId={group.id}
                  index={index}
                  isDragDisabled={group.id === "fixed" || group.id === "hidden"}>
                  {(provided, snapshot) => (
                    <div
                      className="item-container"
                      ref={provided.innerRef}
                      {...provided.dragHandleProps}
                      {...provided.draggableProps}>
                      {buildGroupItemView(group)}
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <div
        className={classNames([
          "tab-container",
          "add-new-group",
          {
            "selected-group-item": current?.id === AddNewNavItem.id
          }
        ])}
        onClick={(e) => onAddNewGroupClick(e)}>
        <PlusOutlined />
      </div>
    </GroupNavStyle>
  )
}

export default GroupNav
