import { styled } from "styled-components"

const Style = styled.div`
  .group-match-mode-container {
    margin: 10px 0 0 0;

    font-size: 14px;

    .select-group-label {
      font-weight: bold;
      margin-right: 10px;
    }

    .ant-tag-checkable {
      border: 1px solid #d9d9d9;
    }

    .ant-tag-checkable-checked {
      border: 1px solid #0984e3;
      background-color: #0984e3;
    }
  }

  .extension-container {
    & h3 {
      font-weight: bold;
      margin: 20px 0;
    }
  }
`

const SearchStyle = styled.div`
  margin-left: 20px;

  input {
    width: 200px;
    height: 30px;

    margin: -1px -1px 0px 0px;

    outline-style: none;
    border: 1px solid #ccc;
    border-radius: 4px;

    &:focus {
      border-color: #66afe9;
      outline: 0;
      box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075), 0 0 4px rgba(102, 175, 233, 0.6);
    }
  }
`

export default Style
export { SearchStyle }
