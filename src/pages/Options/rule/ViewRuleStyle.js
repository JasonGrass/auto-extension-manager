import { styled } from "styled-components"

const Style = styled.div`
  margin-right: 20px;

  .button-group {
    margin-top: 10px;
    margin-bottom: 20px;

    & > * {
      margin-right: 10px;
    }

    button {
      width: 100px;
    }
  }
`

export default Style
