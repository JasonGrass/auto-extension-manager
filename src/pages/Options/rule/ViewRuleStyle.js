import { styled } from "styled-components"

const Style = styled.div`
  margin-right: 20px;

  .ant-table-cell {
    font-size: 14px;
  }

  .rule-scroll-spacer > .ant-table-cell {
    padding: 0 !important;
    border: 0;
  }

  .rule-pagination {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    margin: 16px 0;

    button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      padding: 0;
      border: 0;
      border-radius: 50%;
      background: transparent;
      cursor: pointer;

      &::before {
        content: "";
        width: 8px;
        height: 8px;
        box-sizing: border-box;
        border: 1px solid #bfbfbf;
        border-radius: 50%;
      }

      &:hover::before {
        border-color: #1677ff;
      }

      &[aria-current="page"]::before {
        border-color: #1677ff;
        background: #1677ff;
      }

      &:focus-visible {
        outline: 2px solid #1677ff;
        outline-offset: 1px;
      }
    }
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
