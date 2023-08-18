import React, { memo } from "react"

import { CloseSquareOutlined } from "@ant-design/icons"
import { styled } from "styled-components"

const TriggerWrapper = memo((props) => {
  const { title, onClose } = props

  return (
    <Style>
      <div className="header">
        <span className="header-title">{title}</span>
        <span className="header-close">
          <CloseSquareOutlined onClick={onClose} />
        </span>
      </div>

      <div className="content">{props.children}</div>
    </Style>
  )
})

export default TriggerWrapper

const Style = styled.div`
  border: 1px solid #ccc;
  border-radius: 5px;

  margin: 10px 200px 10px 0;

  .header {
    display: flex;
    justify-content: left;
    align-items: center;

    height: 24px;

    padding-left: 5px;

    font-weight: 700;
    border-radius: 5px 5px 0 0;

    background: #f5f5f5;

    .header-title {
      flex: 1 1 auto;
    }

    .header-close {
      flex: 0 0 auto;

      margin-right: 10px;
      font-size: 16px;
      color: #ff4757;
      cursor: pointer;

      &:hover {
        color: #ff6348;
      }
    }
  }

  .content {
    margin: 5px;
  }
`
