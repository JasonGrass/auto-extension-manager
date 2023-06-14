import { styled } from "styled-components"

const Style = styled.div`
  .operation-box {
    display: inline-block;
    margin-top: 10px;
    border-top: 1px solid #ccc;

    & > button {
      width: 100px;
      margin-top: 10px;
      margin-right: 10px;
    }
  }
`

export default Style
