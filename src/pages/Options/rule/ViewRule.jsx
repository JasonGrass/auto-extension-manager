import React, { memo, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"

import { Button, Table, message } from "antd"

import { getLang } from ".../utils/utils"
import { sendMessage } from "../../../utils/messageHelper"
import EditRule from "./EditRule"
import Style from "./ViewRuleStyle"
import {
  RULE_PAGE_SIZE,
  RULE_SCROLL_HEIGHT,
  getRulePage
} from "./ruleTableScroll.mjs"
import ActionView from "./view/ActionView"
import MatchView from "./view/MatchView"
import OperationView from "./view/OperationView"
import TargetView from "./view/TargetView"

const { Column } = Table

const ViewRule = memo((props) => {
  const [messageApi, contextHolder] = message.useMessage()

  const { options, configs, extensions, operation } = props

  const location = useLocation()
  const navigate = useNavigate()
  const paramRuleId = new URLSearchParams(location.search).get("id")

  // 正在编辑的规则
  const [editingConfig, setEditingConfig] = useState(null)
  const [highlight, setHighlight] = useState(null)
  const selectedRuleId = highlight?.id

  const records = useMemo(
    () => (configs ?? []).map((config, index) => ({ ...config, index })),
    [configs]
  )
  const [currentPage, setCurrentPage] = useState(1)
  const tableContainerRef = useRef(null)
  const scrollToRowRef = useRef(null)
  const handledLocationRef = useRef(null)

  useLayoutEffect(() => {
    // antd 5.5 has no public Table scrollTo API; keep DOM access scoped to this table.
    const body = tableContainerRef.current.querySelector(".ant-table-body")
    const rows = Array.from(body.querySelectorAll(".ant-table-tbody > tr[data-row-key]"))
    let rowTops = []
    let resizeFrame
    const syncPage = () =>
      setCurrentPage(getRulePage(rowTops, body.scrollTop, body.scrollHeight - body.clientHeight))
    const measure = () => {
      const origin = body.getBoundingClientRect().top + body.clientTop - body.scrollTop
      rowTops = rows.map((row) => row.getBoundingClientRect().top - origin)
      syncPage()
    }
    measure()
    scrollToRowRef.current = (index) => {
      measure()
      if (rows[index]) {
        body.scrollTo({ top: rowTops[index], behavior: "instant" })
        syncPage()
      }
    }
    body.addEventListener("scroll", syncPage, { passive: true })
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(resizeFrame)
      resizeFrame = requestAnimationFrame(measure)
    })
    observer.observe(body)
    rows.forEach((row) => observer.observe(row))
    return () => {
      observer.disconnect()
      cancelAnimationFrame(resizeFrame)
      body.removeEventListener("scroll", syncPage)
      scrollToRowRef.current = null
    }
  }, [records])

  // Wait for storage and the DOM before consuming the link or starting the highlight timer.
  useEffect(() => {
    if (!paramRuleId || configs === null) return
    const requestKey = `${location.key}:${paramRuleId}`
    if (handledLocationRef.current === requestKey) return
    handledLocationRef.current = requestKey
    const index = records.findIndex((record) => record.id === paramRuleId)
    if (index === -1) {
      setHighlight(null)
      messageApi.warning(`Rule ${paramRuleId} not found`)
    } else {
      scrollToRowRef.current(index)
      setHighlight({ id: paramRuleId })
    }
    const searchParams = new URLSearchParams(location.search)
    searchParams.delete("id")
    navigate(
      { search: searchParams.toString(), hash: location.hash },
      { replace: true, state: location.state }
    )
  }, [paramRuleId, configs, records, location, navigate, messageApi])

  useEffect(() => {
    if (!highlight) return
    const timer = setTimeout(() => setHighlight(null), 3000)
    return () => clearTimeout(timer)
  }, [highlight])

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

    try {
      await operation.duplicate(record)
    } catch (error) {
      console.error("复制规则配置", error)
      if (error.message.includes("QUOTA_BYTES_PER_ITEM")) {
        // message.error("复制失败，超过浏览器存储限制")
      } else {
        messageApi.error(error.message)
      }
    }
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

    // 如果删除的正是当前正在编辑的，则取消编辑
    if (editingConfig?.id === record.id) {
      setEditingConfig(null)
    }
  }

  const onCancel = () => {
    setEditingConfig(null)
  }

  return (
    <Style>
      {contextHolder}
      <div ref={tableContainerRef}>
        <Table
          dataSource={records}
          rowKey="id"
          size="small"
          loading={configs === null}
          pagination={false}
          scroll={{ y: RULE_SCROLL_HEIGHT }}
          rowClassName={(record, index) => {
            if (record.id === selectedRuleId) {
              return "rule-row-selected"
            } else {
              return ""
            }
          }}>
          <Column
            title={getLang("column_index")}
            dataIndex="index"
            width={60}
            align="center"
            render={(index, record) => {
              if (record.id === selectedRuleId) {
                return <span>✔</span>
              }
              return <span>{index + 1}</span>
            }}
          />
          <Column
            title={getLang("rule_column_match")}
            dataIndex="match"
            render={(match, record) => {
              return <MatchView config={match} options={options}></MatchView>
            }}
          />
          <Column
            title={getLang("rule_column_extensions")}
            dataIndex="target"
            render={(target, record) => {
              return <TargetView config={target} options={options} extensions={extensions} />
            }}
          />

          <Column
            title={getLang("rule_column_action")}
            dataIndex="action"
            width={200}
            render={(action, record) => {
              return <ActionView config={action} />
            }}
          />

          <Column
            title={getLang("rule_column_operation")}
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
      </div>
      {records.length > RULE_PAGE_SIZE && (
        <nav className="rule-pagination" aria-label={getLang("rule_title")}>
          {Array.from({ length: Math.ceil(records.length / RULE_PAGE_SIZE) }, (_, index) => (
            <button
              key={index}
              type="button"
              aria-label={`${getLang("column_index")} ${index * RULE_PAGE_SIZE + 1}–${Math.min(
                (index + 1) * RULE_PAGE_SIZE,
                records.length
              )}`}
              aria-current={currentPage === index + 1 ? "page" : undefined}
              onClick={() => scrollToRowRef.current(index * RULE_PAGE_SIZE)}
            />
          ))}
        </nav>
      )}

      <div className="button-group">
        {!editingConfig && (
          <Button type="primary" onClick={() => onAdd(null)}>
            {getLang("rule_add")}
          </Button>
        )}

        <Button
          onClick={() => {
            chrome.tabs.create({
              url: "https://ext.jgrass.cc/docs/rule"
            })
          }}>
          {getLang("help")}
        </Button>
      </div>

      {editingConfig && (
        <EditRule
          options={options}
          config={editingConfig}
          extensions={extensions}
          onSave={onSave}
          onCancel={onCancel}></EditRule>
      )}
    </Style>
  )
})

export default ViewRule
