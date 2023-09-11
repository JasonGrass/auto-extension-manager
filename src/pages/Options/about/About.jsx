import React, { useEffect, useState } from "react"

import {
  GiftOutlined,
  GithubOutlined,
  HeartOutlined,
  QuestionCircleOutlined
} from "@ant-design/icons"
import { Button, Space, Tag } from "antd"
import newGithubIssueUrl from "new-github-issue-url"

import Icon from ".../assets/img/icon-128.png"
import { SyncOptionsStorage } from ".../storage"
import { getLang } from ".../utils/utils"
import Title from "../Title.jsx"
import { AboutStyle } from "./AboutStyle"

function About() {
  const [version, setVersion] = useState("UNKNOWN")

  useEffect(() => {
    chrome.management.getSelf((self) => {
      setVersion(self.version)
    })
  }, [])

  useEffect(() => {
    SyncOptionsStorage.printUsage()
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
      if (window.navigator.userAgent.includes("Edg/")) {
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

  return (
    <AboutStyle>
      <Title title={getLang("about_title")}></Title>

      <div className="header-icon">
        <img src={Icon} alt="icon" />
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
          <Tag className="badges-tag" icon={<HeartOutlined />} onClick={openRatePage}>
            Rate Me 5 Stars
          </Tag>
          <Tag className="badges-tag" icon={<GiftOutlined />} onClick={openSponsorPage}>
            Buy Me a Coffee
          </Tag>
        </Space>
      </div>
    </AboutStyle>
  )
}

export default About
