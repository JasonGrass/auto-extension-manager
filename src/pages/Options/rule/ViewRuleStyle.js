import { styled } from "styled-components"

const Style = styled.div`
  margin-right: 20px;

  .ant-table-cell {
    font-size: 14px;
  }

  .error-text {
    font-weight: 700;
    color: #f5222d;
  }

  .rule-row-selected {
    animation: flashing 1s infinite;
  }

  @keyframes flashing {
    0% {
      background-color: #95de6400;
    }
    50% {
      background-color: #95de64ff;
    }
    100% {
      background-color: #95de6400;
    }
  }

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
