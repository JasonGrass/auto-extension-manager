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

  .hidden-action-mode {
    display: none;
  }

  .advance-option-tips {
    margin-left: 10px;
    font-size: 8px;
    color: #777;
  }

  .action-tip-url-match {
    margin: 12px 0;
  }

  .action-tip-match-type {
    margin: 12px 0;

    font-size: 12px;
    color: #777;
  }

  .action-show-options {
    margin: 16px 0 0 0;
  }

  .action-refresh-options {
    display: flex;
    margin: 5px 0 10px 0;
  }
`

export default Style
