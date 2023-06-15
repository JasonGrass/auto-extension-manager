import React, { memo } from "react"

import { Space, Table, Tag } from "antd"

import Style from "./ViewRuleStyle"
import MatchView from "./view/MatchView"

const { Column } = Table

const ViewRule = memo(({ config, sceneOption, groupOption }) => {
  console.log(config)

  return (
    <Style>
      <Table dataSource={config} rowKey="id">
        <Column title="ID" dataIndex="id"></Column>
        <Column
          title="匹配"
          dataIndex="match"
          render={(match, record, index) => {
            return (
              <MatchView config={match} sceneOption={sceneOption}></MatchView>
            )
          }}></Column>
      </Table>
    </Style>
  )
})

export default ViewRule
