import React, { useEffect } from "react"

import { DeleteFilled, EditFilled, PlusOutlined } from "@ant-design/icons"
import { Popconfirm, message } from "antd"
import classNames from "classnames"

import { GroupOptions } from ".../storage/index"
import { GroupNavStyle } from "./GroupNavStyle"
import { AddNewNavItem } from "./helpers"

function GroupNav({ groupInfo, current, onSelectedChanged, onGroupItemDeleted, onGroupItemEdit }) {
  let showGroupItems = []
  const fixedGroup = groupInfo.find((g) => g.id === "fixed")
  if (fixedGroup) {
    fixedGroup.name = "固定分组"
    fixedGroup.desc = `这是一个内置分组，此分组中的扩展，在 Popup 中手动切换分组时，不会被禁用。通常将常驻的扩展放在此分组中。
    注意：如果在规则配置中，明确配置关闭某个扩展，即使此扩展在固定分组中，禁用依旧有效。`
    showGroupItems = [fixedGroup, ...groupInfo.filter((g) => g.id !== "fixed")]
  }

  useEffect(() => {
    if (!current || !current.id) {
      selectFirstGroupTab()
    }
  })

  const onGroupTabClick = (e, item) => {
    onSelectedChanged?.(item)
  }

  const onAddNewGroupClick = (e) => {
    onSelectedChanged?.(AddNewNavItem)
  }

  const onEditGroupClick = (e, group) => {
    e.stopPropagation()
    if (group.id === "fixed") {
      message.warning("固定分组的名称不能被编辑")
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

    if (group.id === "fixed") {
      message.warning("固定分组不能被删除")
      return
    }

    await GroupOptions.deleteGroup(group.id)
    if (group.id === current?.id) {
      selectFirstGroupTab(group)
    }

    onGroupItemDeleted?.(group)

    message.info(`delete ${group.name}`)
  }

  return (
    <GroupNavStyle>
      <ul>
        {showGroupItems.map((group) => {
          return (
            <li key={group.id} onClick={(e) => onGroupTabClick(e, group)}>
              <div
                className={classNames([
                  "tab-container",
                  { "selected-group-item": group.id === current?.id }
                ])}>
                <h3>{group.name}</h3>
                <div className="tab-operation">
                  <EditFilled
                    onClick={(e) => onEditGroupClick(e, group)}
                    className="tab-operation-item"
                  />

                  <Popconfirm
                    className="tab-operation-item"
                    title="删除分组"
                    description={`确认删除分组"${group.name}"`}
                    onConfirm={(e) => onDeleteGroupClick(e, group)}
                    onCancel={(e) => e.stopPropagation()}
                    okText="Yes"
                    cancelText="Cancel"
                    onClick={(e) => e.stopPropagation()}>
                    <DeleteFilled />
                  </Popconfirm>
                </div>
              </div>
            </li>
          )
        })}
        <li>
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
        </li>
      </ul>
    </GroupNavStyle>
  )
}

export default GroupNav
