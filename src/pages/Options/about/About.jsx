import React, { useEffect, useState } from "react"

import {
  GithubOutlined,
  HeartOutlined,
  QuestionCircleOutlined,
  StarOutlined
} from "@ant-design/icons"
import { Button, Space, Tag } from "antd"
import newGithubIssueUrl from "new-github-issue-url"

import LightIcon from ".../assets/img/design-devin/AEM-Logo-Light.svg"
import { storage } from ".../storage/sync"
import { isEdgePackage } from ".../utils/channelHelper.js"
import { getLang } from ".../utils/utils"
import Title from "../Title.jsx"
import { AboutStyle } from "./AboutStyle"

function About() {
  const [version, setVersion] = useState("UNKNOWN")
  const [storageMessage, setStorageMessage] = useState("")

  useEffect(() => {
    chrome.management.getSelf((self) => {
      setVersion(self.version)
    })
  }, [])

  useEffect(() => {
    storage.options.getUsage().then((usage) => {
      const use = (usage / 1024).toFixed(2)
      setStorageMessage(`Cloud Storage Usage: ${use}KB / 100KB`)
    })
  }, [])

  const openIssue = () => {
    const url = newGithubIssueUrl({
      user: "JasonGrass",
      repo: "auto-extension-manager",
      body: `
\n\n\n---
<!-- ↑请在此行上方填写问题/建议详情↑ -->
Extension Manager ${version}
${navigator.userAgent}`
    })

    chrome.tabs.create({ url })
  }

  const openHelp = () => {
    chrome.tabs.create({
      url: "https://ext.jgrass.cc/"
    })
  }

  const openGithub = () => {
    chrome.tabs.create({
      url: "https://github.com/JasonGrass/auto-extension-manager"
    })
  }

  const openRatePage = () => {
    chrome.management.getSelf((self) => {
      if (isEdgePackage()) {
        chrome.tabs.create({
          url: `https://microsoftedge.microsoft.com/addons/detail/extension-manager/${self.id}`
        })
      } else {
        chrome.tabs.create({
          url: `https://chrome.google.com/webstore/detail/extension-manager/${self.id}`
        })
      }
    })
  }

  const openSponsorPage = () => {
    chrome.tabs.create({
      url: "https://ext.jgrass.cc/separate/buy-me-a-coffee"
    })
  }

  const openStorageExplainPage = () => {
    chrome.tabs.create({
      url: "https://ext.jgrass.cc/docs/storage"
    })
  }

  return (
    <AboutStyle>
      <Title title={getLang("about_title")}></Title>

      <div className="header-icon">
        <img src={LightIcon} alt="icon" />
        <div className="header-icon-text">
          <h3>Extension Manager</h3>
          <span>{getLang("about_desc")}</span>
        </div>
      </div>

      <div className="content-button">
        <Button onClick={openIssue}>{getLang("about_feedback")}</Button>
        <Button onClick={openHelp}>{getLang("about_help")}</Button>
      </div>

      <div className="footer">
        <span className="version">
          {getLang("about_version")} {version}
        </span>

        <Space size={[0, 8]}>
          <Tag className="badges-tag" icon={<GithubOutlined />} onClick={openGithub}>
            Github
          </Tag>
          <Tag className="badges-tag" icon={<StarOutlined />} onClick={openRatePage}>
            Rate Me 5 Stars
          </Tag>
          <Tag className="badges-tag" icon={<HeartOutlined />} onClick={openSponsorPage}>
            Buy Me a Coffee
          </Tag>
        </Space>
      </div>

      <div className="footer-storage">
        <span>{storageMessage}</span>
        <QuestionCircleOutlined
          className="storage-detail-tip-icon"
          onClick={openStorageExplainPage}
        />
      </div>
    </AboutStyle>
  )
}

export default About
