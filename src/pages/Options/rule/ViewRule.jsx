import React, { memo, useEffect, useState } from "react"

import { Space, Table, Tag } from "antd"

import EditRule from "./EditRule"
import Style from "./ViewRuleStyle"
import ActionView from "./view/ActionView"
import MatchView from "./view/MatchView"
import OperationView from "./view/OperationView"
import TargetView from "./view/TargetView"

const { Map } = require("immutable")

const { Column } = Table

const ViewRule = memo((props) => {
  const { config, sceneOption, groupOption, extensions, operation } = props
  console.log(config)

  const [editingConfig, setEditingConfig] = useState(null)

  const [data, setData] = useState()
  useEffect(() => {
    if (config) {
      setData(config.map((c, index) => Map(c).set("index", index).toJS()))
    }
  }, [config])

  const onEdit = (record) => {
    setEditingConfig(record)
  }
  const onDuplicate = (record) => {}

  return (
    <Style>
      <Table dataSource={data} rowKey="id">
        <Column
          title="序号"
          dataIndex="index"
          width={60}
          align="center"
          render={(index, record) => <p>{index + 1}</p>}
        />
        <Column
          title="匹配"
          dataIndex="match"
          render={(match, record) => {
            return (
              <MatchView config={match} sceneOption={sceneOption}></MatchView>
            )
          }}
        />
        <Column
          title="扩展(组)"
          dataIndex="target"
          render={(target, record) => {
            return (
              <TargetView
                config={target}
                groupOption={groupOption}
                extensions={extensions}
              />
            )
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
                id={id}
                record={record}
                operation={operation}
                onEdit={onEdit}
                onDuplicate={onDuplicate}
              />
            )
          }}
        />
      </Table>

      <EditRule
        extensions={extensions}
        config={editingConfig}
        sceneOption={sceneOption}
        groupOption={groupOption}></EditRule>
    </Style>
  )
})

export default ViewRule
