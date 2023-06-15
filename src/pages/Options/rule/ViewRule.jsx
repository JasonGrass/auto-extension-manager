import React, { memo } from "react"

import { Space, Table, Tag } from "antd"

import Style from "./ViewRuleStyle"
import MatchView from "./view/MatchView"
import TargetView from "./view/TargetView"

const { Column } = Table

const ViewRule = memo(({ config, sceneOption, groupOption, extensions }) => {
  console.log(config)

  return (
    <Style>
      <Table dataSource={config} rowKey="id">
        <Column title="ID" dataIndex="id" />
        <Column
          title="匹配"
          dataIndex="match"
          render={(match, record, index) => {
            return (
              <MatchView config={match} sceneOption={sceneOption}></MatchView>
            )
          }}
        />
        <Column
          title="扩展(组)"
          dataIndex="target"
          render={(target, record, index) => {
            return (
              <TargetView
                config={target}
                groupOption={groupOption}
                extensions={extensions}
              />
            )
          }}
        />
      </Table>
    </Style>
  )
})

export default ViewRule
