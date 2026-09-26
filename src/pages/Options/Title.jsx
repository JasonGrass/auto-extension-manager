import React from "react"

import styled from "styled-components"

const TitleStyle = styled.div`
  color: ${(props) => props.theme.fg2};

  h1 {
    margin: 0;
    font-size: 24px;
    line-height: 36px;
    font-weight: 600;
  }

  .box {
    margin-bottom: 24px;
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
