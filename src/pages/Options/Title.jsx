import React from "react"
import styled from "styled-components"

const TitleStyle = styled.div`
  color: #333;

  h1 {
    font-size: 30px;
    line-height: 60px;
  }

  .box {
    border-bottom: 1px solid #eee;
    margin-bottom: 10px;
  }
`

function Title({ title }) {
  return (
    <TitleStyle>
      <div className="box">
        <h1>{title}</h1>
      </div>
    </TitleStyle>
  )
}

export default Title
