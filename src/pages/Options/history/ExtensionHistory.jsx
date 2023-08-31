import React, { memo, useEffect, useState } from "react"

import { Alert, Button, Checkbox, Form, Input, Table, Tooltip, message } from "antd"

import ExtensionHistoryDetail from "./ExtensionHistoryDetail"
import Style from "./ExtensionHistoryStyle"
import { formatEventText, formatTimeAbsolute, formatTimeRelative } from "./formatter"

const ExtensionHistory = memo(({ records }) => {
  const [timeShowWay, setTimeShowWay] = useState("relative") //absolute relative

  const columns = [
    Table.EXPAND_COLUMN,
    {
      title: "序号",
      dataIndex: "id",
      key: "index",
      width: 60,
      render: (text, record, index) => {
        return <span className="column-index">{(index + 1).toString().padStart(3, "0")}</span>
      }
    },
    {
      title: "时间",
      dataIndex: "timestamp",
      key: "time",
      width: 150,
      render: (timestamp, record, index) => {
        if (timeShowWay === "absolute") {
          return <span className="column-time">{formatTimeAbsolute(timestamp)}</span>
        } else {
          return <span className="column-time">{formatTimeRelative(timestamp)}</span>
        }
      }
    },
    {
      title: "事件",
      dataIndex: "event",
      key: "event",
      width: 60,
      render: (event, record, index) => {
        return <span className="column-event">{formatEventText(event)}</span>
      }
    },
    {
      title: "名称",
      dataIndex: "name",
      key: "name",
      width: 320,
      ellipsis: {
        showTitle: false
      },
      render: (name, record, index) => {
        return (
          <span className="column-name">
            <img src={record.icon} alt="" width={16} height={16} />
            <span>{name}</span>
          </span>
        )
      }
    },
    {
      title: "版本",
      dataIndex: "version",
      key: "version",
      width: 100,
      render: (version, record, index) => {
        return <span className="column-version">{version} </span>
      }
    },
    {
      title: "备注",
      dataIndex: "remark",
      key: "remark",
      width: 320,
      render: (remark, record, index) => formatRemark(record)
    }
  ]

  const onTimeShowWayChange = (e) => {
    if (e.target.checked) {
      setTimeShowWay("absolute")
    } else {
      setTimeShowWay("relative")
    }
  }

  return (
    <Style>
      <div>
        <Checkbox checked={timeShowWay === "absolute"} onChange={onTimeShowWayChange}>
          绝对时间
        </Checkbox>
      </div>

      <Table
        rowKey="id"
        pagination={{ pageSize: 100 }}
        scroll={{ y: "calc(100vh - 260px)" }}
        columns={columns}
        expandable={{
          expandedRowRender: (record) => {
            return <ExtensionHistoryDetail record={record}></ExtensionHistoryDetail>
          },
          expandRowByClick: true
        }}
        dataSource={records}></Table>
    </Style>
  )
})

export default ExtensionHistory

const formatRemark = (record) => {
  const remark = record.remark
  const ruleId = record.ruleId
  const groupId = record.groupId

  if (ruleId) {
    const url = `options.html#/rule?id=${ruleId}`
    return (
      <span>
        由
        <a
          className="column-remark-link"
          href={url}
          target="_blank"
          rel="noreferrer"
          onClick={(e) => e.stopPropagation()}>
          规则
        </a>
        触发
      </span>
    )
  }

  if (groupId) {
    const url = `options.html#/group?id=${groupId}`
    return (
      <span>
        由
        <a
          className="column-remark-link"
          href={url}
          target="_blank"
          rel="noreferrer"
          onClick={(e) => e.stopPropagation()}>
          切换分组
        </a>
        触发
      </span>
    )
  }

  return <span>{remark}</span>
}
