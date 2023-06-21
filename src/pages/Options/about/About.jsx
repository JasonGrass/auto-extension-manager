import React, { useEffect, useState } from "react"

import { Button } from "antd"
import newGithubIssueUrl from "new-github-issue-url"

import Icon from ".../assets/img/icon-128.png"
import Title from "../Title.jsx"
import { AboutStyle } from "./AboutStyle"

function About() {
  const [version, setVersion] = useState("UNKNOWN")

  useEffect(() => {
    chrome.management.getSelf((self) => {
      setVersion(self.version)
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

  return (
    <AboutStyle>
      <Title title="关于"></Title>

      <div className="header-icon">
        <img src={Icon} alt="icon" />
        <div className="header-icon-text">
          <h3>Extension Manager</h3>
          <span>一个可以根据规则自动打开或关闭浏览器扩展的工具</span>
        </div>
      </div>

      <div className="content-button">
        <Button onClick={openIssue}>反馈问题</Button>
        <Button>查看帮助</Button>
      </div>

      <div className="footer">
        <span>版本 {version}</span>
        <a
          href="https://github.com/JasonGrass/auto-extension-manager"
          target="_blank"
          rel="noreferrer">
          Github
        </a>
      </div>
    </AboutStyle>
  )
}

export default About
