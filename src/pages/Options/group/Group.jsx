import { DeleteFilled, EditFilled, PlusOutlined } from "@ant-design/icons"
import { Button, Form, Input, Popconfirm, message } from "antd"
import classNames from "classnames"
import React, { useEffect, useState } from "react"
import chromeP from "webext-polyfill-kinda"

import optionsStorage, { GroupOptions } from ".../storage/index"
import { getIcon } from ".../utils/extensionHelper"
import Title from "../Title.jsx"
import AddNewGroup from "./AddNewGroup"
import { GroupStyle } from "./GroupStyle"

const { TextArea } = Input

function GroupManagement() {
  const addNewGroup = {
    name: "新建分组",
    id: "__add__"
  }

  const [extensions, setExtensions] = useState([])
  const [groupInfo, setGroupInfo] = useState([])
  const [selectedGroup, setSelectedGroup] = useState()

  async function updateByGroupConfigs() {
    const info = await GroupOptions.getGroups()
    setGroupInfo(info)

    console.log("updateByGroupConfigs", info)
  }

  function selectFirstGroupTab() {
    if (groupInfo && groupInfo[0]) {
      setSelectedGroup(groupInfo[0])
    } else {
      setSelectedGroup(addNewGroup)
    }
  }

  useEffect(() => {
    async function getExts() {
      const exts = await chromeP.management.getAll()
      setExtensions(exts)
    }

    async function initGroupConfigs() {
      await updateByGroupConfigs()
      selectFirstGroupTab()
    }

    getExts()
    initGroupConfigs()
  }, [])

  const onGroupTabClick = (e, item) => {
    setSelectedGroup(item)
  }

  const onAddNewGroupClick = (e) => {
    setSelectedGroup(addNewGroup)
  }

  const onEditGroupClick = (e, group) => {
    e.stopPropagation()
    message.info(`edit ${group.name}`)
  }

  const onDeleteGroupClick = async (e, group) => {
    e.stopPropagation()

    await GroupOptions.deleteGroup(group.id)
    await updateByGroupConfigs()
    if (group.id === selectedGroup?.id) {
      selectFirstGroupTab()
    }

    message.info(`delete ${group.name}`)
  }

  const onNewGroupAdded = async (group) => {
    await updateByGroupConfigs()
    setSelectedGroup(group)
    message.info(`添加分组 ${group.name}`)
  }

  return (
    <GroupStyle>
      <Title title="分组管理"></Title>

      <div className="group-edit-box">
        <ul className="left-box">
          {groupInfo.map((group) => {
            return (
              <li key={group.id} onClick={(e) => onGroupTabClick(e, group)}>
                <div
                  className={classNames([
                    "tab-container",
                    { "selected-group-item": group.id === selectedGroup?.id }
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
                { "selected-group-item": checkSelectedGroup("__add__") }
              ])}
              onClick={(e) => onAddNewGroupClick(e)}>
              <PlusOutlined />
            </div>
          </li>
        </ul>

        <div className="right-box">
          <div className={classNames({ "view-hidden": !checkSelectedGroup() })}>
            <p className="desc">{selectedGroup?.desc}</p>
            <h3>「{selectedGroup?.name}」中的插件</h3>
            {buildExtContainer(extensions, "active-items")}
            <h3>剩余未分组</h3>
            {buildExtContainer(extensions, "no-group-items")}
          </div>
          <div
            className={classNames({
              "view-hidden": !checkSelectedGroup("__add__")
            })}>
            <h3>{addNewGroup.name}</h3>
            <div style={{ maxWidth: 600 }}>
              <AddNewGroup onNewGroupAdded={onNewGroupAdded}></AddNewGroup>
            </div>
          </div>
        </div>
      </div>
    </GroupStyle>
  )

  /**
   * 检查当前分组是否为指定分组；
   * @param id 需要检查的分组 id，为空则表示检查普通分组（不是特殊的功能分组，如新建）
   * @returns true: 当前分组与参数匹配; false: 当前分组与参数不匹配
   */
  function checkSelectedGroup(id) {
    if (!selectedGroup) {
      return false
    }

    if (!id && selectedGroup.id !== "__add__") {
      return true
    }

    return selectedGroup.id === id
  }

  function buildExtContainer(extItems, containerClassName) {
    const onIconClick = (e, item) => {
      console.log(item)
    }

    return (
      <ul className={classNames([containerClassName, "ext-container"])}>
        {extItems.map((item) => {
          return (
            <li
              key={item.id}
              className={classNames({
                "ext-item": true,
                "not-enable": !item.enabled
              })}>
              <img
                src={getIcon(item, 32)}
                alt=""
                onClick={(e) => onIconClick(e, item)}
              />
              <span>{item.shortName}</span>
            </li>
          )
        })}
      </ul>
    )
  }
}

export default GroupManagement
