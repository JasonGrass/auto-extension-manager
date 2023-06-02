import { DeleteFilled, EditFilled, PlusOutlined } from "@ant-design/icons"
import { Button, Form, Input, Popconfirm, message } from "antd"
import classNames from "classnames"
import React, { useEffect, useState } from "react"
import chromeP from "webext-polyfill-kinda"

import { GroupOptions } from ".../storage/index"
import { getIcon } from ".../utils/extensionHelper"
import Title from "../Title.jsx"
import AddNewGroup from "./AddNewGroup.jsx"
import GroupNav from "./GroupNav.jsx"
import { GroupStyle } from "./IndexGroupStyle.js"
import { AddNewNavItem, checkSelectedGroup } from "./helpers.js"

const { TextArea } = Input

function GroupManagement() {
  const [extensions, setExtensions] = useState([])
  const [groupInfo, setGroupInfo] = useState([])
  const [selectedGroup, setSelectedGroup] = useState()

  async function updateByGroupConfigs() {
    const info = await GroupOptions.getGroups()
    setGroupInfo(info)
  }

  useEffect(() => {
    async function getExts() {
      const exts = await chromeP.management.getAll()
      setExtensions(exts)
    }

    async function initGroupConfigs() {
      await updateByGroupConfigs()
    }

    getExts()
    initGroupConfigs()
  }, [])

  const onSelectedChanged = (item) => {
    setSelectedGroup(item)
  }

  const onGroupAdded = async (group) => {
    await updateByGroupConfigs()
    setSelectedGroup(group)
  }

  const onGroupDeleted = async (item) => {
    await updateByGroupConfigs()
  }

  return (
    <GroupStyle>
      <Title title="分组管理"></Title>

      <div className="group-edit-box">
        <div className="left-box">
          <GroupNav
            groupInfo={groupInfo}
            current={selectedGroup}
            onSelectedChanged={onSelectedChanged}
            onGroupItemDeleted={onGroupDeleted}></GroupNav>
        </div>

        <div className="right-box">
          <div
            className={classNames({
              "view-hidden": !checkSelectedGroup(selectedGroup)
            })}>
            <p className="desc">{selectedGroup?.desc}</p>
            <h3>「{selectedGroup?.name}」中的插件</h3>
            {buildExtContainer(extensions, "active-items")}
            <h3>剩余未分组</h3>
            {buildExtContainer(extensions, "no-group-items")}
          </div>
          <div
            className={classNames({
              "view-hidden": !checkSelectedGroup(selectedGroup, "__add__")
            })}>
            <h3>{AddNewNavItem.name}</h3>
            <div style={{ maxWidth: 600 }}>
              <AddNewGroup onNewGroupAdded={onGroupAdded}></AddNewGroup>
            </div>
          </div>
        </div>
      </div>
    </GroupStyle>
  )

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
