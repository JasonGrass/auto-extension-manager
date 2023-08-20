import React, { memo, useEffect, useRef, useState } from "react"

import { DeleteOutlined, HomeOutlined, SettingOutlined } from "@ant-design/icons"
import { Button, Space } from "antd"
import classNames from "classnames"
import { styled } from "styled-components"

import { getIcon } from ".../utils/extensionHelper.js"
import { isStringEmpty } from ".../utils/utils.js"

const ExtensionGridItem = memo(({ item, options }) => {
  const existOptionPage = !isStringEmpty(item.optionsUrl)
  const existHomePage = !isStringEmpty(item.homepageUrl)

  const [itemEnable, setItemEnable] = useState(item.enabled)

  const [isMouseEnter, setIsMouseEnter] = useState(false)
  const [isMouseLeft, setIsMouseLeft] = useState(false)

  const [isMenuOnRight, setIsMenuOnRight] = useState(true)
  const containerRef = useRef(null)
  const menuRef = useRef(null)

  const checkMenuPosition = () => {
    const containerRect = containerRef.current.getBoundingClientRect()
    const menuRect = menuRef.current.getBoundingClientRect()
    const rightSpace = window.innerWidth - containerRect.right

    if (rightSpace < menuRect.width) {
      setIsMenuOnRight(false)
    } else {
      setIsMenuOnRight(true)
    }
  }

  useEffect(() => {
    checkMenuPosition()
  }, [isMouseEnter])

  const handleMouseEnter = () => {
    setIsMouseEnter(true)
    setIsMouseLeft(false)
  }

  const handleMouseLeave = () => {
    setIsMouseLeft(true)
    setIsMouseEnter(false)
  }

  /**
   * 打开扩展设置页面
   */
  const handleSettingButtonClick = (e, item) => {
    chrome.tabs.create({ url: item.optionsUrl })
  }

  /**
   * 打开扩展主页
   */
  const handleHomeButtonClick = (e, item) => {
    chrome.tabs.create({ url: item.homepageUrl })
  }

  /**
   * 删除扩展
   */
  const handleDeleteButtonClick = (e, item) => {
    chrome.management.uninstall(item.id)
    setIsMouseEnter(false)
  }

  return (
    <Style ref={containerRef} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <div className="grid-display-item">
        <img src={getIcon(item, 48)} alt="icon" />
      </div>
      <div
        className={classNames([
          "operation-menu",
          {
            "menu-right": isMenuOnRight,
            "menu-left": !isMenuOnRight,
            "menu-on": isMouseEnter
          }
        ])}
        ref={menuRef}>
        <h3 className="operation-menu-title">{item.name}</h3>
        <div className="operation-menu-items">
          <Space disabled={!existOptionPage} onClick={(e) => handleSettingButtonClick(e, item)}>
            <SettingOutlined />
          </Space>

          <Space onClick={(e) => handleDeleteButtonClick(e, item)}>
            <DeleteOutlined />
          </Space>

          <Space disabled={!existHomePage} onClick={(e) => handleHomeButtonClick(e, item)}>
            <HomeOutlined />
          </Space>
        </div>
      </div>
    </Style>
  )
})

export default ExtensionGridItem

const Style = styled.div`
  position: relative;

  img {
    width: 42px;
    height: 42px;
  }

  .grid-display-item {
    transition: transform 0.3s ease;

    &:hover {
      transform: scale(1.2);
    }
  }

  .operation-menu {
    display: none;
    position: absolute;
    width: 130px;
    height: 64px;

    z-index: 1000;

    border-radius: 4px;
    background-color: #24bfc4;

    box-shadow: #24c1c0 0px 1px 4px;
  }

  .operation-menu-title {
    padding: 5px;
    color: #fff;
    text-align: center;

    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    border-radius: 4px 4px 0px 0px;
    background-color: #27b0d4;
  }

  .operation-menu-items {
    display: flex;
    align-items: center;
    justify-content: space-around;

    margin-top: 5px;

    font-size: 22px;
    color: #fff;
  }

  .menu-on {
    display: block;
  }

  @keyframes menu-right-in {
    0% {
      opacity: 0;
      transform: translateX(10%);
    }

    100% {
      opacity: 1;
      transform: translateX(0%);
    }
  }

  @keyframes menu-left-in {
    0% {
      opacity: 0;
      transform: translateX(-10%);
    }

    100% {
      opacity: 1;
      transform: translateX(0%);
    }
  }

  .menu-right {
    opacity: 0;
    top: -10px;
    left: 48px;

    animation: menu-right-in 0.3s ease-out 0.15s forwards;
  }

  .menu-left {
    opacity: 0;
    top: -10px;
    right: 48px;

    animation: menu-left-in 0.3s ease-out 0.15s forwards;
  }
`
