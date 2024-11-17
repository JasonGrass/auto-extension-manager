import React, { memo, useEffect, useRef, useState } from "react"

import {
  CloseOutlined,
  CopyOutlined,
  MenuOutlined,
  MoreOutlined,
  RedoOutlined
} from "@ant-design/icons"
import { Dropdown, Space } from "antd"
import dayjs from "dayjs"
import localforage from "localforage"

import { MoreOperationDropdownSnapshotStyle } from "./MoreOperationDropdownStyle.js"

const forage = localforage.createInstance({
  driver: localforage.LOCALSTORAGE,
  name: "Popup",
  version: 1.0,
  storeName: "ext-snapshot"
})

const MoreOperationDropdown = memo(({ options, className, messageApi }) => {
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    readSnapshot()
  }, [refreshKey])

  // 删除所有快照
  const deleteAllSnapshot = async () => {
    forage.clear()
    messageApi.info(`delete all snapshot`)
    updateView()
  }

  // 初始化快照子菜单
  const initSnapshotMenu = [
    { key: "delete-all-snapshot", label: "删除全部快照", onClick: deleteAllSnapshot }
  ]

  const [snapshotMenuList, setSnapshotMenuList] = useState(initSnapshotMenu)

  function resumeSnapshot(snapshot) {
    console.log(`resumeSnapshot ${snapshot}`)
    messageApi.info(`resume snapshot ${snapshot.key}`)
    for (const extState of snapshot.states) {
      chrome.management.setEnabled(extState.id, extState.enabled)
    }
    updateView()
  }

  function deleteSnapshot(snapshot) {
    console.log(`deleteSnapshot ${snapshot}`)
    messageApi.info(`delete snapshot ${snapshot.key}`)
    forage.removeItem(snapshot.key)
    updateView()
  }

  function updateView() {
    setRefreshKey((prevKey) => prevKey + 1)
  }

  const readSnapshot = async () => {
    const allSnapshotKeys = await forage.keys()
    const snapshots = [...initSnapshotMenu]
    for (const key of allSnapshotKeys) {
      const snapshot = await forage.getItem(key)
      const resumeOne = () => {
        resumeSnapshot(snapshot)
      }
      const deleteOne = () => {
        deleteSnapshot(snapshot)
      }

      snapshots.unshift({
        key: key,
        label: (
          <MoreOperationDropdownSnapshotStyle>
            <span className="snapshot-label" onClick={resumeOne}>
              {key}
            </span>
            <Space className="snapshot-close-btn" onClick={deleteOne}>
              <CloseOutlined />
            </Space>
          </MoreOperationDropdownSnapshotStyle>
        )
      })
    }
    setSnapshotMenuList(snapshots)
  }

  // 禁用全部扩展（除了自己）
  const disableAllExtension = async () => {
    const allExtensions = await chrome.management.getAll()
    const self = await chrome.management.getSelf()
    const selfId = self.id

    for (const ext of allExtensions) {
      if (ext.id === selfId) {
        continue
      }
      if (ext.type !== "extension" || ext.enabled === false) {
        continue
      }
      chrome.management.setEnabled(ext.id, false)
    }
    console.log("[Popup Menu] disable all extension")
  }

  // 保存当前快照
  const saveExtensionStateSnapshot = async () => {
    const allExtensions = await chrome.management.getAll()
    const self = await chrome.management.getSelf()
    const selfId = self.id
    const extSnapshotStats = []
    for (const ext of allExtensions) {
      if (ext.id === selfId) {
        continue
      }
      if (ext.type !== "extension") {
        continue
      }
      extSnapshotStats.push({
        id: ext.id,
        enabled: ext.enabled
      })
    }

    if (extSnapshotStats.length < 1) {
      messageApi.info("no any extensions")
      return
    }

    const snapshotKey = dayjs().format("MMDD.HHmmss")
    forage.setItem(snapshotKey, { key: snapshotKey, states: extSnapshotStats })
    messageApi.info(`snapshot save success. ${snapshotKey}`)

    updateView()
  }

  // MenuProps["items"]
  const moreOperationMenuItems = [
    {
      key: "disable-all-ext",
      label: "禁用全部扩展",
      icon: <CloseOutlined />,
      onClick: disableAllExtension
    },
    {
      key: "save-ext-snapshot",
      label: "保存扩展快照",
      icon: <CopyOutlined />,
      onClick: saveExtensionStateSnapshot
    },
    {
      key: "restore-snapshot",
      label: <span>恢复快照</span>,
      icon: <RedoOutlined />,
      children: snapshotMenuList
    }
  ]

  return (
    <div className={className} key={refreshKey}>
      <Space className="setting-icon">
        <Dropdown
          menu={{ items: moreOperationMenuItems }}
          placement="bottomLeft"
          trigger={["click"]}>
          <MenuOutlined />
        </Dropdown>
      </Space>
    </div>
  )
})

export default MoreOperationDropdown
