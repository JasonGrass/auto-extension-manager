import { styled } from "styled-components"

const Style = styled.div`
  .action-label {
    font-size: 14px;
  }

  .advance-options {
    display: flex;
    & > span {
      margin-right: 5px;
    }
  }

  .action-refresh-options {
    display: flex;
  }

  .hidden-action-mode {
    display: none;
  }

  .advance-option-tips {
    margin-left: 10px;
    font-size: 8px;
    color: #777;
  }
`

export default Style
