import React, { memo, useEffect, useState } from "react"

import { Col, Result, Row } from "antd"
import { styled } from "styled-components"

import { isEdgeRuntime } from ".../utils/channelHelper"
import { getLang } from ".../utils/utils"

const ExtensionExpandedDetails = memo(({ ext, showTitle, showVersion }) => {
  const [manageUrl, setManageUrl] = useState("")

  useEffect(() => {
    if (!ext) {
      return
    }
    if (isEdgeRuntime()) {
      setManageUrl(`edge://extensions/?id=${ext.id}`)
    } else {
      setManageUrl(`chrome://extensions/?id=${ext.id}`)
    }
  }, [ext])

  if (!ext) {
    return <Result status="warning" title="There are some problems with displaying the details." />
  }

  const onManageClick = (event) => {
    event.preventDefault()
    event.stopPropagation()
    chrome.tabs.create({
      url: manageUrl
    })
  }

  const onHomePageClick = (event) => {
    event.preventDefault()
    event.stopPropagation()
    chrome.tabs.create({
      url: ext.homepageUrl
    })
  }

  return (
    <Style>
      {showTitle && (
        <Row>
          <Col span={2}></Col>
          <Col>
            <span className="detail-main-title">{ext.name}</span>
          </Col>
        </Row>
      )}

      {/* <Row>
        <Col span={2}>
          <span className="detail-title">short name:</span>
        </Col>
        <Col>
          <span>{ext.shortName}</span>
        </Col>
      </Row> */}

      <Row>
        <Col span={2}>
          <span className="detail-title">id:</span>
        </Col>
        <Col span={6}>
          <span>{ext.id}</span>
        </Col>
        <Col span={2}>
          <span className="detail-title">Type:</span>
        </Col>
        <Col span={6}>
          <span>{ext.type}</span>
        </Col>
      </Row>

      <Row>
        <Col span={2}>
          <span className="detail-title">homepage:</span>
        </Col>
        <Col>
          <a href={ext.homepageUrl} onClick={onHomePageClick}>
            {ext.homepageUrl}
          </a>
        </Col>
      </Row>

      <Row>
        <Col span={2}>
          <span className="detail-title">description:</span>
        </Col>
        <Col>
          <span>{ext.description}</span>
        </Col>
      </Row>

      {showVersion && (
        <Row>
          <Col span={2}>
            <span className="detail-title">version:</span>
          </Col>
          <Col>
            <span>{ext.version}</span>
          </Col>
        </Row>
      )}

      <Row>
        <Col span={2}></Col>
        <Col>
          <a href={manageUrl} onClick={onManageClick}>
            {getLang("history_manage_extension")}
          </a>
        </Col>
      </Row>
    </Style>
  )
})

export default ExtensionExpandedDetails

const Style = styled.div`
  .ant-row {
    margin-top: 5px;
  }

  .detail-main-title {
    font-size: 14px;
    font-weight: bold;
  }

  .detail-title {
    display: inline-block;
    width: 100%;

    padding-right: 5px;

    text-align: right;
  }
`
