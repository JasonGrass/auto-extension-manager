import { styled } from "styled-components"

const Style = styled.div`
  .rule-name-input {
    max-width: 600px;
  }

  .operation-box {
    display: inline-block;
    margin-top: 10px;
    margin-bottom: 20px;
    border-top: 1px solid ${(props) => props.theme.border3};

    & > button {
      width: 100px;
      margin-top: 10px;
      margin-right: 10px;
    }
  }
`

export default Style
