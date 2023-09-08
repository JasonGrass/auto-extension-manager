import React, { memo, useEffect, useState } from "react"

import { EyeOutlined } from "@ant-design/icons"
import {
  Alert,
  Button,
  Checkbox,
  Form,
  Input,
  Popconfirm,
  Space,
  Table,
  Tooltip,
  message
} from "antd"
import chromeP from "webext-polyfill-kinda"

import { getLang } from ".../utils/utils"
import { downloadIconDataUrl, getIcon } from "../../../utils/extensionHelper"
import isMatch from "../../../utils/searchHelper"
import { ExtensionRepo } from "../../Background/extension/ExtensionRepo"
import { HistoryRepo } from "../../Background/history/HistoryRepo"
import ExtensionHistoryDetail from "./ExtensionHistoryDetail"
import Style from "./ExtensionHistoryStyle"
import { formatEventText, formatTimeAbsolute, formatTimeRelative } from "./formatter"

const { Search } = Input

const ExtensionHistory = memo(({ records }) => {
  const [timeShowWay, setTimeShowWay] = useState("relative") //absolute relative
  // 搜索词
  const [searchWord, setSearchWord] = useState("")

  // 显示的记录
  const [shownRecords, setShownRecords] = useState(records)

  const solo = (e, record) => {
    e.stopPropagation()
    setSearchWord(record.extensionId)
  }

  const columns = [
    Table.EXPAND_COLUMN,
    {
      title: getLang("column_index"),
      dataIndex: "index",
      key: "index",
      width: 60,
      render: (dataIndex, record, index) => {
        return <span className="column-index">{(dataIndex + 1).toString().padStart(3, "0")}</span>
      }
    },
    {
      title: getLang("column_time"),
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
      title: getLang("column_event"),
      dataIndex: "event",
      key: "event",
      width: 60,
      render: (event, record, index) => {
        return <span className="column-event">{formatEventText(event)}</span>
      }
    },
    {
      title: getLang("column_name"),
      dataIndex: "name",
      key: "name",
      width: 320,
      ellipsis: {
        showTitle: false
      },
      render: (name, record, index) => {
        let showName = name
        if (record.__attach__?.alias) {
          showName = record.__attach__.alias
        }

        return (
          <span className="column-name">
            <div className="column-name-title">
              <img src={record.icon} alt="" width={16} height={16} />
              <span>{showName}</span>
            </div>
            <div className="column-name-solo">
              <Space onClick={(e) => solo(e, record)}>
                <EyeOutlined />
              </Space>
            </div>
          </span>
        )
      }
    },
    {
      title: getLang("column_version"),
      dataIndex: "version",
      key: "version",
      width: 100,
      render: (version, record, index) => {
        return <span className="column-version">{version} </span>
      }
    },
    {
      title: getLang("column_remark"),
      dataIndex: "remark",
      key: "remark",
      width: 200,
      render: (remark, record, index) => formatRemark(record)
    }
  ]

  // 执行搜索
  useEffect(() => {
    setShownRecords(search(records, searchWord))
  }, [records, searchWord])

  const onSearch = (value) => {
    setSearchWord(value)
  }

  const onTimeShowWayChange = (e) => {
    if (e.target.checked) {
      setTimeShowWay("absolute")
    } else {
      setTimeShowWay("relative")
    }
  }

  // 清空历史记录
  const confirmClearHistoryRecords = async () => {
    setShownRecords([])
    setSearchWord("")
    // 清除记录
    await new HistoryRepo().clearAll()
    // 清除 Extension 缓存
    const extRepo = new ExtensionRepo()
    await extRepo.clear()
    // 重建 Extension 缓存
    const list = await chromeP.management.getAll()
    const now = Date.now()
    for (const item of list) {
      const iconDataUrl = await downloadIconDataUrl(item)
      const ext = { ...item, icon: iconDataUrl, recordUpdateTime: now }
      extRepo.set(ext)
    }
  }

  return (
    <Style>
      <div className="history-manage-tools">
        <div className="history-manage-tools-left">
          <Search
            className="search"
            placeholder="search"
            allowClear
            value={searchWord}
            onSearch={onSearch}
            onChange={(e) => onSearch(e.target.value)}
          />
          <Checkbox
            className="setting-operation-item"
            checked={timeShowWay === "absolute"}
            onChange={onTimeShowWayChange}>
            {getLang("history_absolute_time")}
          </Checkbox>
        </div>
        <div className="history-manage-tools-right">
          <Popconfirm
            title="Clear History Data"
            description="Are you sure to delete all the history records?"
            onConfirm={confirmClearHistoryRecords}
            okText="Yes"
            cancelText="No">
            <Button className="setting-operation-item">{getLang("history_clean_record")}</Button>
          </Popconfirm>
        </div>
      </div>

      <Table
        rowKey="id"
        pagination={{ pageSize: 100, showSizeChanger: false }}
        scroll={{ y: "calc(100vh - 260px)" }}
        columns={columns}
        expandable={{
          expandedRowRender: (record) => {
            return <ExtensionHistoryDetail record={record}></ExtensionHistoryDetail>
          },
          expandRowByClick: true
        }}
        dataSource={shownRecords}></Table>
    </Style>
  )
})

export default ExtensionHistory

/**
 * 格式化备注的显示
 */
const formatRemark = (record) => {
  const remark = record.remark
  const ruleId = record.ruleId
  const groupId = record.groupId

  if (ruleId) {
    const url = `options.html#/rule?id=${ruleId}`
    return (
      <span>
        {getLang("history_cause")}
        <a
          className="column-remark-link"
          href={url}
          target="_blank"
          rel="noreferrer"
          onClick={(e) => e.stopPropagation()}>
          {getLang("history_rule")}
        </a>
        {getLang("history_raise")}
      </span>
    )
  }

  if (groupId) {
    const url = `options.html#/group?id=${groupId}`
    return (
      <span>
        {getLang("history_cause")}
        <a
          className="column-remark-link"
          href={url}
          target="_blank"
          rel="noreferrer"
          onClick={(e) => e.stopPropagation()}>
          {getLang("history_switch_group")}
        </a>
        {getLang("history_raise")}
      </span>
    )
  }

  return <span>{remark}</span>
}

const search = (records, word) => {
  if (!word || word.trim() === "") return records

  return records.filter((record) => {
    const target = [
      record.name,
      record.__extension__?.shortName,
      record.__extension__?.description,
      record.__attach__?.alias,
      record.__attach__?.remark,
      record.extensionId
    ]

    return isMatch(target, word, true)
  })
}
