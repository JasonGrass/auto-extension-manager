import { styled } from "styled-components"

const Style = styled.div`
  display: flex;
  align-items: center;

  height: 42px;
  padding: 0px 5px;
  margin-bottom: 2px;

  box-shadow: 0px 0px 3px 1px rgba(0, 0, 0, 0.3);

  background-color: ${(props) => props.theme.bg};
  color: ${(props) => props.theme.fg};

  .left,
  .right {
    display: flex;
    align-items: center;
  }

  .left {
    flex-grow: 1;

    img {
      margin-left: 8px;
      margin-right: 12px;
      width: 24px;
      height: 24px;
    }
  }

  .right .ant-space {
    &:hover {
      color: #555;
    }
  }

  .right .dropdown {
    margin: 0 4px;
  }

  .right .search {
    margin: 0 4px;
  }

  .right .layout {
    margin: 0 4px;
  }

  .right .setting {
    margin: -2px 4px 0 4px;
  }

  .right .more-operation {
    margin: -2px 4px 0 4px;
  }

  .setting-icon {
    font-size: 20px;
    &:hover {
      color: #555;
    }
  }

  .menu-item-text {
    display: inline-block;
    max-width: 80px;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }
`

const SearchStyle = styled.div`
  position: relative;

  input {
    width: 100%;
    height: 30px;

    margin: -1px -1px 0px 0px;

    outline-style: none;
    border: 1px solid ${(props) => props.theme.input_border};
    border-radius: 1px;

    &:focus {
      border-color: #66afe9cc;
      outline: 0;
      box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075), 0 0 2px rgba(102, 175, 233, 0.6);
    }

    background-color: ${(props) => props.theme.bg};
    color: ${(props) => props.theme.fg};
  }

  .store-icon {
    position: absolute;
    &:hover {
      cursor: pointer;
    }
  }

  .chrome-store-icon {
    top: 4px;
    right: 10px;
    width: 24px;
  }

  .edge-store-icon {
    top: 1px;
    right: 10px;
    width: 24px;
  }
`

export default Style
export { SearchStyle }
