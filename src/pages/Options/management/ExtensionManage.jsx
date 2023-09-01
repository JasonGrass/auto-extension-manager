import React, { memo, useEffect, useState } from "react"

import { Alert, Button, Checkbox, Form, Input, Table, Tooltip, message } from "antd"

import { ManageOptions } from ".../storage"
import { getIcon, sortExtension } from ".../utils/extensionHelper"
import isMatch from ".../utils/searchHelper"
import { ExtensionManageStyle } from "./ExtensionManageStyle"

const { Search } = Input

const columns = [
  Table.EXPAND_COLUMN,
  {
    title: "序号",
    dataIndex: "index",
    key: "index",
    width: 60,
    render: (text, record, index) => {
      return <span className="column-index">{(index + 1).toString().padStart(2, "0")}</span>
    }
  },
  {
    title: "扩展",
    dataIndex: "name",
    key: "name",
    width: 320,
    ellipsis: {
      showTitle: false
    },
    render: (name, record, index) => {
      return (
        <Tooltip placement="topLeft" title={name}>
          <span className="column-name">
            <img src={record.icon} alt="" width={16} height={16} />
            <span>{name}</span>
          </span>
        </Tooltip>
      )
    }
  },
  {
    title: "别名",
    dataIndex: "alias",
    key: "alias",
    width: 320
  },
  {
    title: "备注",
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

  // 初始化
  useEffect(() => {
    const initData = buildRecords(extensions, config)
    setData(initData)
    setShownData(initData)
  }, [extensions, config])

  // 搜索
  useEffect(() => {
    setShownData(search(data, searchWord, searchExistAlias, searchExistRemark))
  }, [data, searchWord, searchExistAlias, searchExistRemark])

  // 执行搜索
  const onSearch = (value) => {
    setSearchWord(value)
  }

  // 重新加载配置
  const reload = () => {
    ManageOptions.get().then((res) => {
      var reloadData = buildRecords(extensions, res)
      setData(reloadData)
    })
  }

  const onExistAliasChange = (e) => {
    const value = e.target.checked
    setSearchExistAlias(value)
  }

  const onExistRemarkChange = (e) => {
    const value = e.target.checked
    setSearchExistRemark(value)
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
          存在别名
        </Checkbox>

        <Checkbox
          checked={searchExistRemark}
          onChange={onExistRemarkChange}
          className="search-checkbox">
          存在备注
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
    await ManageOptions.updateExtension(record.id, { alias, remark })
    message.success("update success")
    reload()
  }
  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo)
    message.error(`update fail. ${errorInfo.errorFields[0]?.errors[0]}`)
  }

  const info = `${record.description} (version: ${record.version})`

  return (
    <div>
      <Alert message={info} type="info" style={{ marginBottom: 16 }} />

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
          label="别名"
          name="alias"
          rules={[
            {
              message: "扩展别名长度最大50",
              max: 50
            }
          ]}>
          <Input />
        </Form.Item>
        <Form.Item
          wrapperCol={{
            span: 20
          }}
          label="备注"
          name="remark"
          rules={[
            {
              message: "备注长度最大为 100",
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
            保存
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

  return sortExtension(records)
}

function search(records, searchText, existAlias, existRemark) {
  if ((!searchText || searchText.trim() === "") && !existAlias && !existRemark) {
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
}

export default ExtensionManage
