import { styled } from "styled-components"

const Style = styled.div`
  margin-right: 20px;

  .ant-table-cell {
    font-size: 14px;
  }

  .error-text {
    font-weight: 700;
    color: ${(props) => props.theme.danger};
  }

  .rule-row-selected {
    animation: flashing 1s infinite;
  }

  @keyframes flashing {
    0% {
      background-color: transparent;
    }
    50% {
      background-color: ${(props) => props.theme.primary_soft_strong};
    }
    100% {
      background-color: transparent;
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
