import React, { memo, useEffect, useState } from "react"

import { Button, Checkbox, Form, Input, Table, Tooltip, message } from "antd"
import classNames from "classnames"

import storage from ".../storage/sync"
import { isEdgeRuntime } from ".../utils/channelHelper"
import { getIcon, sortExtension } from ".../utils/extensionHelper"
import isMatch from ".../utils/searchHelper"
import { getLang } from ".../utils/utils"
import ExtensionExpandedDetails from "../components/ExtensionExpandedDetails"
import { ExtensionManageStyle } from "./ExtensionManageStyle"

const { Search } = Input

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
    width: 360,
    ellipsis: {
      showTitle: false
    },
    render: (name, record, index) => {
      return (
        <Tooltip placement="topLeft" title={name}>
          <span className="column-name">
            <img src={record.icon} alt="" width={16} height={16} />
            <span className="column-name-title">{name}</span>
            {((isEdgeRuntime() && record.channel) || record.channel === "Development") && (
              <span
                className={classNames([
                  "column-name-channel",
                  `column-name-channel-${record.channel}`
                ])}>
                {record.channel}
              </span>
            )}
          </span>
        </Tooltip>
      )
    }
  },
  {
    title: getLang("column_alias"),
    dataIndex: "alias",
    key: "alias",
    width: 320
  },
  {
    title: getLang("column_remark"),
    dataIndex: "remark",
    key: "remark"
  }
]

const ExtensionManage = memo(({ extensions, config }) => {
  // 全部数据
  const [data, setData] = useState([])
  // 展示的数据
  const [shownData, setShownData] = useState([])

  // 搜索词
  const [searchWord, setSearchWord] = useState("")
  // 搜索 存在别名
  const [searchExistAlias, setSearchExistAlias] = useState(false)
  // 搜索 存在备注
  const [searchExistRemark, setSearchExistRemark] = useState(false)
  // 搜索 没有设置别名
  const [searchNoAlias, setSearchNoAlias] = useState(false)
  // 搜索 没有设置备注
  const [searchNoRemark, setSearchNoRemark] = useState(false)

  // 初始化
  useEffect(() => {
    const initData = buildRecords(extensions, config)
    setData(initData)
    setShownData(initData)
  }, [extensions, config])

  // 搜索
  useEffect(() => {
    setShownData(
      search(data, searchWord, searchExistAlias, searchExistRemark, searchNoAlias, searchNoRemark)
    )
  }, [data, searchWord, searchExistAlias, searchExistRemark, searchNoAlias, searchNoRemark])

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

  const onExistAliasChange = (e) => {
    const value = e.target.checked
    if (value) {
      setSearchNoAlias(false)
    }
    setSearchExistAlias(value)
  }

  const onExistRemarkChange = (e) => {
    const value = e.target.checked
    if (value) {
      setSearchNoRemark(false)
    }
    setSearchExistRemark(value)
  }

  const onNoAliasChange = (e) => {
    const value = e.target.checked
    if (value) {
      setSearchExistAlias(false)
    }
    setSearchNoAlias(value)
  }

  const onNoRemarkChange = (e) => {
    const value = e.target.checked
    if (value) {
      setSearchExistRemark(false)
    }
    setSearchNoRemark(value)
  }

  return (
    <ExtensionManageStyle>
      <div className="extension-manage-tools">
        <Search
          className="search"
          placeholder="search"
          onSearch={onSearch}
          onChange={(e) => onSearch(e.target.value)}
        />

        <Checkbox
          checked={searchExistAlias}
          onChange={onExistAliasChange}
          className="search-checkbox">
          {getLang("alias_exist")}
        </Checkbox>

        <Checkbox
          checked={searchExistRemark}
          onChange={onExistRemarkChange}
          className="search-checkbox">
          {getLang("alias_remark_exist")}
        </Checkbox>

        <Checkbox checked={searchNoAlias} onChange={onNoAliasChange} className="search-checkbox">
          {getLang("alias_empty")}
        </Checkbox>

        <Checkbox checked={searchNoRemark} onChange={onNoRemarkChange} className="search-checkbox">
          {getLang("alias_remark_empty")}
        </Checkbox>
      </div>

      {/* [实现 antd table 自动调整可视高度 - 掘金](https://juejin.cn/post/6922375503798075400#comment ) */}
      <Table
        pagination={{ pageSize: 100, showSizeChanger: false }}
        scroll={{ y: "calc(100vh - 260px)" }}
        columns={columns}
        expandable={{
          expandedRowRender: (record) => (
            <ExpandEditor record={record} reload={reload}></ExpandEditor>
          ),
          expandRowByClick: true
        }}
        dataSource={shownData}
      />
    </ExtensionManageStyle>
  )
})

const ExpandEditor = ({ record, reload }) => {
  const initValue = record
  const onFinish = async (values) => {
    const alias = values.alias?.trim() ?? ""
    const remark = values.remark?.trim() ?? ""
    await storage.management.updateExtension(record.id, { alias, remark })
    message.success("update success")
    reload()
  }
  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo)
    message.error(`update fail. ${errorInfo.errorFields[0]?.errors[0]}`)
  }

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <ExtensionExpandedDetails ext={record}></ExtensionExpandedDetails>
      </div>

      <Form
        labelCol={{
          span: 1
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
            offset: 1
          }}>
          <Button type="primary" htmlType="submit" style={{ width: 100 }}>
            {getLang("save")}
          </Button>
        </Form.Item>
      </Form>
    </div>
  )
}

function buildRecords(extensions, configs) {
  if (!extensions) {
    return []
  }

  if (!configs) {
    throw new Error("configs is required")
  }

  let records = []

  for (const extension of extensions) {
    const config = configs.extensions?.find((item) => item.extId === extension.id)

    let record = {
      key: extension.id,
      ...extension,
      alias: config?.alias,
      remark: config?.remark,
      icon: getIcon(extension),
      __attach__: config
    }
    record.enabled = true // 这里不考虑扩展的开启与禁用，都设置成 true，是为了让下面的排序不受影响
    records.push(record)
  }

  // 在别名设置页面，按照原始名称排序，不考虑别名
  return sortExtension(records, { useAlias: false })
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
