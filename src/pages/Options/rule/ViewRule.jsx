import React, { memo, useEffect, useState } from "react"

import { Button, Table } from "antd"

import { sendMessage } from "../../../utils/messageHelper"
import EditRule from "./EditRule"
import Style from "./ViewRuleStyle"
import ActionView from "./view/ActionView"
import MatchView from "./view/MatchView"
import OperationView from "./view/OperationView"
import TargetView from "./view/TargetView"

const { Map } = require("immutable")

const { Column } = Table

const ViewRule = memo((props) => {
  const { options, configs, extensions, operation } = props

  // 正在编辑的规则
  const [editingConfig, setEditingConfig] = useState(null)

  // 规则列表
  const [records, setRecords] = useState()
  useEffect(() => {
    if (configs) {
      setRecords(configs.map((c, index) => Map(c).set("index", index).toJS()))
    }
  }, [configs])

  const onAdd = () => {
    setEditingConfig({})
  }

  const onEdit = (record) => {
    setEditingConfig(record)
  }

  const onDuplicate = async (record) => {
    if (!record) {
      return
    }
    await operation.duplicate(record)
  }

  const onSave = async (record) => {
    if (!record) {
      return
    }
    // 如果 record 没有 id，表示是新增的数据
    if (!record.id || record.id === "") {
      record.enable = true // 默认开启
      await operation.add(record)
      setEditingConfig(null)
    } else {
      await operation.update(record)
      setEditingConfig(null)
    }

    sendMessage("rule-config-changed")
  }

  const onEnabled = async (record, enable) => {
    if (!record) {
      return
    }
    record.enable = enable
    await operation.update(record)
    sendMessage("rule-config-changed")
  }

  const onDelete = async (record) => {
    await operation.delete(record.id)
    sendMessage("rule-config-changed")
  }

  const onCancel = () => {
    setEditingConfig(null)
  }

  return (
    <Style>
      <Table
        dataSource={records}
        rowKey="id"
        size="small"
        pagination={{ position: ["bottomCenter"], hideOnSinglePage: true }}>
        <Column
          title="序号"
          dataIndex="index"
          width={60}
          align="center"
          render={(index, record) => <span>{index + 1}</span>}
        />
        <Column
          title="匹配"
          dataIndex="match"
          render={(match, record) => {
            return <MatchView config={match} options={options}></MatchView>
          }}
        />
        <Column
          title="扩展(组)"
          dataIndex="target"
          render={(target, record) => {
            return <TargetView config={target} options={options} extensions={extensions} />
          }}
        />

        <Column
          title="动作"
          dataIndex="action"
          width={200}
          render={(action, record) => {
            return <ActionView config={action} />
          }}
        />

        <Column
          title="操作"
          dataIndex="id"
          width={400}
          render={(id, record) => {
            return (
              <OperationView
                record={record}
                onEdit={onEdit}
                onDuplicate={onDuplicate}
                onDelete={onDelete}
                onEnabled={onEnabled}
              />
            )
          }}
        />
      </Table>

      <div className="button-group">
        {!editingConfig && (
          <Button type="primary" onClick={() => onAdd(null)}>
            新增
          </Button>
        )}

        <Button
          onClick={() => {
            chrome.tabs.create({
              url: "https://github.com/JasonGrass/auto-extension-manager/wiki"
            })
          }}>
          帮助
        </Button>
      </div>

      <EditRule
        options={options}
        config={editingConfig}
        extensions={extensions}
        onSave={onSave}
        onCancel={onCancel}></EditRule>
    </Style>
  )
})

export default ViewRule
