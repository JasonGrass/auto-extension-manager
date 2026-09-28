import { styled } from "styled-components"

const Style = styled.div`
  min-width: 0;

  .ant-table-cell {
    font-size: 14px;
  }

  .rule-name-text {
    overflow-wrap: anywhere;
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
        border: 1px solid ${(props) => props.theme.input_border};
        border-radius: 50%;
      }

      &:hover::before {
        border-color: ${(props) => props.theme.nav_link};
      }

      &[aria-current="page"]::before {
        border-color: ${(props) => props.theme.nav_link};
        background: ${(props) => props.theme.nav_link};
      }

      &:focus-visible {
        outline: 2px solid ${(props) => props.theme.nav_link};
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
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-top: 10px;
    margin-bottom: 20px;

    button {
      min-width: 100px;
    }
  }
`

export default Style
