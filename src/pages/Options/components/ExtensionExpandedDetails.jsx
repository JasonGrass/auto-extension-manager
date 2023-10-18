import React, { memo, useEffect, useState } from "react"

import { Col, Result, Row } from "antd"
import dayjs from "dayjs"
import { styled } from "styled-components"

import { isEdgeRuntime } from ".../utils/channelHelper"
import { getHomepageUrl } from ".../utils/extensionHelper"
import { getLang } from ".../utils/utils"
import { ExtensionRepo } from "../../Background/extension/ExtensionRepo"

const extensionRepo = new ExtensionRepo()

/**
 * 扩展的展开详情，在别名、历史记录表格行中展开，展示的更多信息
 */
const ExtensionExpandedDetails = memo(({ ext, showTitle, showMore }) => {
  const [manageUrl, setManageUrl] = useState("")
  const [webStoreUrl, setWebStoreUrl] = useState("")
  const [installTime, setInstallTime] = useState()
  const [updateTime, setUpdateTime] = useState()

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

  useEffect(() => {
    if (!ext) {
      return
    }
    setWebStoreUrl(getHomepageUrl(ext, true))
  }, [ext])

  useEffect(() => {
    if (!showMore || !ext) {
      return
    }

    extensionRepo.get(ext.id).then((record) => {
      if (record.installDate) {
        setInstallTime(dayjs(record.installDate).format("YYYY-MM-DD HH:mm:ss"))
      }
      if (record.updateDate) {
        setUpdateTime(dayjs(record.updateDate).format("YYYY-MM-DD HH:mm:ss"))
      }
    })
  }, [ext, showMore])

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

  const onLinkClick = (event, url) => {
    event.preventDefault()
    event.stopPropagation()
    chrome.tabs.create({
      url: url
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

      {showMore && (
        <Row>
          <Col span={2}>
            <span className="detail-title">id:</span>
          </Col>
          <Col span={6}>
            <span>{ext.id}</span>
          </Col>
        </Row>
      )}

      {showMore && (
        <Row>
          <Col span={2}>
            <span className="detail-title">version:</span>
          </Col>
          <Col span={3}>
            <span>{ext.version}</span>
          </Col>
          <Col span={2}>
            <span className="detail-title">type:</span>
          </Col>
          <Col span={3}>
            <span>{ext.type}</span>
          </Col>
          <Col span={2}>
            <span className="detail-title">installType:</span>
          </Col>
          <Col span={3}>
            <span>{ext.installType}</span>
          </Col>
        </Row>
      )}

      {showMore && (
        <Row>
          <Col span={2}>
            <span className="detail-title">installTime:</span>
          </Col>
          <Col span={3}>
            <span>{installTime ?? "unknown"}</span>
          </Col>
          <Col span={2}>
            <span className="detail-title">updateTime:</span>
          </Col>
          <Col span={3}>
            <span>{updateTime ?? "unknown"}</span>
          </Col>
        </Row>
      )}

      <Row>
        <Col span={2}>
          <span className="detail-title">homepage:</span>
        </Col>
        <Col>
          <a href={ext.homepageUrl} onClick={(e) => onLinkClick(e, ext.homepageUrl)}>
            {ext.homepageUrl}
          </a>
        </Col>
      </Row>

      {webStoreUrl && webStoreUrl !== ext.homepageUrl && (
        <Row>
          <Col span={2}>
            <span className="detail-title">web store:</span>
          </Col>
          <Col>
            <a href={webStoreUrl} onClick={(e) => onLinkClick(e, webStoreUrl)}>
              {webStoreUrl}
            </a>
          </Col>
        </Row>
      )}

      <Row>
        <Col span={2}>
          <span className="detail-title">description:</span>
        </Col>
        <Col>
          <span>{ext.description}</span>
        </Col>
      </Row>

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
