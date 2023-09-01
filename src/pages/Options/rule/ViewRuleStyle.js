import { styled } from "styled-components"

const Style = styled.div`
  margin-right: 20px;

  .rule-edit-tools {
    margin: 8px 0;
  }

  .rule-edit-storage-limit-tip {
    padding: 4px 8px;
    border: 1px solid #ffeb3b;
    border-radius: 5px;
    background-color: #fffbe6;

    font-size: 14px;
  }

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
