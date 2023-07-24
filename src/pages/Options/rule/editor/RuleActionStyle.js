import { styled } from "styled-components"

const Style = styled.div`
  .action-container {
    display: flex;
    flex-direction: column;
    align-items: flex-start;

    margin: 10px 0;

    & > * {
      margin: 0 0 10px 0;
    }
  }

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
    flex-direction: column;
  }

  .hidden-action-mode {
    display: none;
  }
`

export default Style
