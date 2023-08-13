import React, { memo, useEffect, useState } from "react"

import { Button, Form, Input, Table, Tooltip, message } from "antd"

import { ManageOptions } from ".../storage"
import { getIcon } from ".../utils/extensionHelper"
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
      return (index + 1).toString().padStart(2, "0")
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
          <span>
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
  const [data, setData] = useState([])
  const [shownData, setShownData] = useState([])
  const [searchValue, setSearchValue] = useState("")

  useEffect(() => {
    const initData = buildRecords(extensions, config)
    setData(initData)
    setShownData(initData)
  }, [extensions, config])

  const onSearch = (value) => {
    setSearchValue(value)
    setShownData(search(data, value))
  }

  const reload = () => {
    ManageOptions.get().then((res) => {
      var reloadData = buildRecords(extensions, res)
      setData(reloadData)
      setShownData(search(reloadData, searchValue))
    })
  }

  return (
    <ExtensionManageStyle>
      <Search
        placeholder="search"
        onSearch={onSearch}
        onChange={(e) => onSearch(e.target.value)}
        style={{
          width: 200
        }}
      />
      <Table
        pagination={{ pageSize: 100 }}
        scroll={{
          y: 670
        }}
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
    await ManageOptions.updateExtension(record.id, values)
    message.success("update success")
    reload()
  }
  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo)
    message.error(`update fail. ${errorInfo.errorFields[0]?.errors[0]}`)
  }
  return (
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
            message: "插件别名长度最大50",
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
  )
}

function buildRecords(extensions, configs) {
  console.log("buildRecords", configs)

  let records = []

  for (const extension of extensions) {
    const config = configs.extensions?.filter((item) => item.extId === extension.id)[0]

    let record = {
      key: extension.id,
      id: extension.id,
      name: extension.name,
      shortName: extension.shortName,
      version: extension.version,
      alias: config?.alias,
      remark: config?.remark,
      icon: getIcon(extension)
    }

    records.push(record)
  }
  return records
}

function search(records, searchText) {
  if (!searchText || searchText.trim() === "") {
    return records
  }

  return records.filter((record) => {
    const target = [record.name, record.shortName, record.alias, record.remark]
    return isMatch(target, searchText, false)
  })
}

export default ExtensionManage
