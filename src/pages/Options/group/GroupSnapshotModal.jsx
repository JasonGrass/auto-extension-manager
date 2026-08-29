import React, { useEffect, useState } from "react"

import { CameraOutlined, ExportOutlined, ImportOutlined } from "@ant-design/icons"
import { Button, Input, List, Modal, Popconfirm, Space, message } from "antd"

import storage from ".../storage/sync"
import {
  GroupSnapshotStorage,
  validateImportedSnapshot
} from ".../storage/local/GroupSnapshotStorage"
import { downloadFile, getLang } from ".../utils/utils"

const snapshotStorage = new GroupSnapshotStorage()

/**
 * 分组快照管理弹窗：保存当前全部分组为快照、查看列表、恢复、删除。
 * 与 Popup 的扩展状态快照同一套交互习惯（时间键 + 保存/恢复/删除）。
 * 恢复是覆盖性操作，走 Popconfirm 二次确认；确认后的刷新由父级 onRestored 处理。
 */
function GroupSnapshotModal({ open, onClose, onRestored }) {
  const [messageApi, contextHolder] = message.useMessage()

  const [snapshots, setSnapshots] = useState([])
  const [name, setName] = useState("")
  const [saving, setSaving] = useState(false)

  const refreshList = async () => {
    setSnapshots(await snapshotStorage.list())
  }

  useEffect(() => {
    if (open) {
      setName("")
      refreshList()
    }
  }, [open])

  const onSave = async () => {
    setSaving(true)
    try {
      const groups = await storage.group.getGroups()
      const snapshot = await snapshotStorage.save(groups, name)
      setName("")
      messageApi.success(`${getLang("group_snapshot_saved")}: ${snapshot.name}`)
      await refreshList()
    } catch (error) {
      messageApi.error(String(error?.message ?? error))
    } finally {
      setSaving(false)
    }
  }

  const onRestore = async (snapshot) => {
    try {
      await storage.group.replaceAll(snapshot.groups ?? [])
      messageApi.success(`${getLang("group_snapshot_restored")}: ${snapshot.name}`)
      await onRestored?.()
      onClose?.()
    } catch (error) {
      messageApi.error(String(error?.message ?? error))
    }
  }

  const onDelete = async (snapshot) => {
    await snapshotStorage.remove(snapshot.key)
    messageApi.success(getLang("group_snapshot_deleted"))
    await refreshList()
  }

  // 导出快照为 JSON 文件（与设置页的配置导出同款下载方式）。
  // 文件带 type 标记，导入时据此校验，防止导入无关 JSON 搞坏分组配置
  const onExport = (snapshot) => {
    const data = {
      type: "group-snapshot",
      version: 1,
      name: snapshot.name,
      groups: snapshot.groups,
      exportedAt: new Date().toISOString()
    }
    // 文件名里的快照名可能含路径非法字符，替换为下划线
    const safeName = String(snapshot.name).replace(/[\\/:*?"<>|]/g, "_")
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    downloadFile(blob, `group_snapshot_${safeName}.json`)
  }

  // 导入快照：动态创建 file input 选 JSON 文件，校验通过后入库为新快照
  const onImport = () => {
    const inputElement = document.createElement("input")
    inputElement.setAttribute("type", "file")
    inputElement.setAttribute("accept", ".json")
    inputElement.click()

    inputElement.onchange = async (event) => {
      const file = event.target?.files?.[0]
      if (!file) {
        return
      }
      try {
        const jsonText = await file.text()
        const valid = validateImportedSnapshot(JSON.parse(jsonText))
        if (!valid) {
          messageApi.error(getLang("group_snapshot_import_invalid"))
          return
        }
        const snapshot = await snapshotStorage.save(valid.groups, valid.name)
        messageApi.success(`${getLang("group_snapshot_imported")}: ${snapshot.name}`)
        await refreshList()
      } catch (error) {
        // JSON.parse 失败等解析错误也归入格式不正确的提示
        console.warn("[GroupSnapshot] 导入失败:", error)
        messageApi.error(getLang("group_snapshot_import_invalid"))
      }
    }
  }

  return (
    <Modal
      title={
        <Space>
          <CameraOutlined />
          {getLang("group_snapshot_title")}
        </Space>
      }
      open={open}
      onCancel={onClose}
      width={560}
      footer={null}>
      {contextHolder}

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <Input
          style={{ flex: 1 }}
          value={name}
          placeholder={getLang("group_snapshot_name_placeholder")}
          maxLength={30}
          allowClear
          onChange={(e) => setName(e.target.value)}
          onPressEnter={onSave}
        />
        <Button type="primary" loading={saving} onClick={onSave}>
          {getLang("group_snapshot_save")}
        </Button>
      </div>

      <div style={{ marginBottom: 16 }}>
        <Button icon={<ImportOutlined />} onClick={onImport}>
          {getLang("group_snapshot_import")}
        </Button>
      </div>

      <List
        dataSource={snapshots}
        locale={{ emptyText: getLang("group_snapshot_empty") }}
        renderItem={(item) => (
          <List.Item
            actions={[
              <Popconfirm
                key="restore"
                title={getLang("group_snapshot_restore_confirm")}
                onConfirm={() => onRestore(item)}
                okText="Yes"
                cancelText="No">
                <Button size="small" type="link">
                  {getLang("group_snapshot_restore")}
                </Button>
              </Popconfirm>,
              <Button
                key="export"
                size="small"
                type="link"
                icon={<ExportOutlined />}
                onClick={() => onExport(item)}>
                {getLang("group_snapshot_export")}
              </Button>,
              <Button key="delete" size="small" type="link" danger onClick={() => onDelete(item)}>
                {getLang("group_snapshot_delete")}
              </Button>
            ]}>
            <List.Item.Meta
              title={item.name}
              description={getLang("group_snapshot_meta", item.count, item.extCount)}
            />
          </List.Item>
        )}
      />
    </Modal>
  )
}

export default GroupSnapshotModal
