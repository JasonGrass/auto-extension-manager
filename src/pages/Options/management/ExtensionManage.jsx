import React, { memo, useEffect, useState } from "react"
import { NavLink } from "react-router-dom"

import { ImportOutlined, ShareAltOutlined } from "@ant-design/icons"
import { Button, Checkbox, Form, Input, Table, message } from "antd"
import classNames from "classnames"
import localforage from "localforage"

import storage from ".../storage/sync"
import { isEdgeRuntime } from ".../utils/channelHelper"
import isMatch from ".../utils/searchHelper"
import { getLang } from ".../utils/utils"
import ExtensionExpandedDetails from "../components/ExtensionExpandedDetails"
import { ExtensionManageStyle } from "./ExtensionManageStyle"
import ExtensionNameItem from "./ExtensionNameItem"
import ExtensionOperationItem from "./ExtensionOperationItem"
import { buildRecords } from "./utils"

const { Search } = Input

const forage = localforage.createInstance({
  driver: localforage.LOCALSTORAGE,
  name: "LocalOptions",
  version: 1.0,
  storeName: "management"
})

const ExtensionManage = memo(({ extensions, options }) => {
  const [messageApi, contextHolder] = message.useMessage()

  // 全部数据
  const [data, setData] = useState([])
  // 展示的数据
  const [shownData, setShownData] = useState([])

  // 搜索词
  const [searchWord, setSearchWord] = useState("")

  // 操作
  const [showOperation, setShowOperation] = useState(false)

  // 初始化
  useEffect(() => {
    if (!options.management) {
      return
    }
    const initData = buildRecords(extensions, options.management)
    setData(initData)
    setShownData(initData)
  }, [extensions, options])

  useEffect(() => {
    const init = async () => {
      const show = await forage.getItem("showOperationColumn")
      setShowOperation(show ?? false)
    }
    init()
  }, [])

  // 搜索
  useEffect(() => {
    setShownData(search(data, searchWord))
  }, [data, searchWord])

  // 执行搜索
  const onSearch = (value) => {
    setSearchWord(value)
  }

  // 重新加载配置
  const reload = () => {
    storage.management.get().then((res) => {
      var reloadData = buildRecords(extensions, res)
      setData(reloadData)
    })
  }

  const [columns, setColumns] = useState([])
  useEffect(() => {
    setColumns(buildColumns(showOperation))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showOperation])

  const buildColumns = (showOperation) => {
    const columns = [
      Table.EXPAND_COLUMN,
      {
        title: getLang("column_index"),
        dataIndex: "index",
        key: "index",
        width: 80,
        render: (text, record, index) => {
          return <span className="column-index">{(index + 1).toString().padStart(2, "0")}</span>
        }
      },
      {
        title: getLang("column_extension"),
        dataIndex: "name",
        key: "name",
        width: 380,
        ellipsis: {
          showTitle: false
        },
        render: (name, record, index) => {
          return <ExtensionNameItem name={name} record={record}></ExtensionNameItem>
        },
        filters: isEdgeRuntime()
          ? [
              {
                text: "Edge",
                value: "Edge"
              },
              {
                text: "Chrome",
                value: "Chrome"
              },
              {
                text: "Dev",
                value: "Development"
              }
            ]
          : [
              {
                text: "Dev",
                value: "Development"
              }
            ],
        onFilter: (value, record) => {
          return record.channel === value
        }
      },

      {
        title: getLang("column_alias"),
        dataIndex: "alias",
        key: "alias",
        width: 320,
        filters: [
          { text: getLang("alias_exist"), value: "has_alias" },
          { text: getLang("alias_empty"), value: "no_alias" }
        ],
        onFilter: (value, record) => {
          if (value === "has_alias") {
            return Boolean(record.alias)
          }
          if (value === "no_alias") {
            return !Boolean(record.alias)
          }
        }
      },
      {
        title: getLang("column_remark"),
        dataIndex: "remark",
        key: "remark",
        filters: [
          { text: getLang("alias_remark_exist"), value: "has_remark" },
          { text: getLang("alias_remark_empty"), value: "no_remark" }
        ],
        onFilter: (value, record) => {
          if (value === "has_remark") {
            return Boolean(record.remark)
          }
          if (value === "no_remark") {
            return !Boolean(record.remark)
          }
        }
      }
    ]

    if (showOperation) {
      columns.splice(3, 0, {
        title: getLang("rule_column_operation"),
        key: "operation",
        width: 180,
        className: showOperation ? "" : "column-hidden",
        render: (_, record, index) => {
          return <ExtensionOperationItem record={record} options={options}></ExtensionOperationItem>
        }
      })
    }
    return columns
  }

  return (
    <ExtensionManageStyle>
      {contextHolder}
      <div className="extension-manage-tools">
        <div className="extension-manage-tools-left">
          <Search
            className="search"
            placeholder="search"
            onSearch={onSearch}
            onChange={(e) => onSearch(e.target.value)}
          />

          <Checkbox
            checked={showOperation}
            onChange={(e) => {
              setShowOperation(e.target.checked)
              forage.setItem("showOperationColumn", e.target.checked)
            }}
            className="search-checkbox">
            {getLang("management_show_operation")}
          </Checkbox>
        </div>

        <div className="extension-manage-tools-right">
          <NavLink to="/management/share">
            {/* TODO lang */}
            <Button icon={<ShareAltOutlined />}>分享/导出</Button>
          </NavLink>

          <NavLink to="/management/import">
            {/* TODO lang */}
            <Button icon={<ImportOutlined />}>导入</Button>
          </NavLink>
        </div>
      </div>

      {/* [实现 antd table 自动调整可视高度 - 掘金](https://juejin.cn/post/6922375503798075400#comment ) */}
      <Table
        pagination={{ pageSize: 100, showSizeChanger: false }}
        scroll={{ y: "calc(100vh - 260px)" }}
        columns={columns}
        expandable={{
          expandedRowRender: (record) => (
            <ExpandEditor record={record} reload={reload} messageApi={messageApi}></ExpandEditor>
          ),
          expandRowByClick: true
        }}
        dataSource={shownData}
      />
    </ExtensionManageStyle>
  )
})

const ExpandEditor = ({ record, reload, messageApi }) => {
  const initValue = record
  const onFinish = async (values) => {
    const alias = values.alias?.trim() ?? ""
    const remark = values.remark?.trim() ?? ""
    await storage.management.updateExtension(record.id, { alias, remark })
    messageApi.success("update success")
    reload()
  }
  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo)
    messageApi.error(`update fail. ${errorInfo.errorFields[0]?.errors[0]}`)
  }

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <ExtensionExpandedDetails ext={record}></ExtensionExpandedDetails>
      </div>

      <Form
        autoComplete="off"
        labelCol={{
          span: 2
        }}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        initialValues={initValue}>
        <Form.Item
          wrapperCol={{
            span: 12
          }}
          label={getLang("column_alias")}
          name="alias"
          rules={[
            {
              message: getLang("alias_max_length"),
              max: 50
            }
          ]}>
          <Input />
        </Form.Item>
        <Form.Item
          wrapperCol={{
            span: 20
          }}
          label={getLang("column_remark")}
          name="remark"
          rules={[
            {
              message: getLang("alias_remark_max_length"),
              max: 100
            }
          ]}>
          <Input />
        </Form.Item>
        <Form.Item
          wrapperCol={{
            offset: 2
          }}>
          <Button type="primary" htmlType="submit" style={{ width: 100 }}>
            {getLang("save")}
          </Button>
        </Form.Item>
      </Form>
    </div>
  )
}

function search(records, searchText, existAlias, existRemark, noAlias, noRemark) {
  if (
    (!searchText || searchText.trim() === "") &&
    !existAlias &&
    !existRemark &&
    !noAlias &&
    !noRemark
  ) {
    return records
  }

  return records
    .filter((record) => {
      const target = [
        record.name,
        record.shortName,
        record.description,
        record.alias,
        record.remark
      ]
      return isMatch(target, searchText, true)
    })
    .filter((record) => {
      if (existAlias) {
        return record.alias
      } else {
        return true
      }
    })
    .filter((record) => {
      if (existRemark) {
        return record.remark
      } else {
        return true
      }
    })
    .filter((record) => {
      if (noAlias) {
        return !Boolean(record.alias)
      } else {
        return true
      }
    })
    .filter((record) => {
      if (noRemark) {
        return !Boolean(record.remark)
      } else {
        return true
      }
    })
}

export default ExtensionManage
