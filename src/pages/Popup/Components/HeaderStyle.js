import { styled } from "styled-components"

const Style = styled.div`
  display: flex;
  align-items: center;

  height: 42px;
  padding: 0px 5px;
  margin-bottom: 0;

  box-shadow: ${(props) => props.theme.header_shadow};

  background-color: ${(props) => props.theme.surface};
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
      color: ${(props) => props.theme.nav_link};
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
      color: ${(props) => props.theme.nav_link};
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
  padding: 0 8px;
  height: 30px;
  background-color: ${(props) => props.theme.surface};

  input {
    box-sizing: border-box;
    width: 100%;
    height: 30px;

    margin: 0;
    padding: 4px 36px 4px 10px;

    outline-style: none;
    border: 1px solid ${(props) => props.theme.input_border};
    border-radius: 6px;

    &::placeholder {
      color: ${(props) => props.theme.fg4};
      opacity: 1;
    }

    &:focus {
      border-color: ${(props) => props.theme.nav_link};
      outline: 0;
      box-shadow: 0 0 0 2px ${(props) => props.theme.focus_ring};
    }

    background-color: ${(props) => props.theme.surface};
    color: ${(props) => props.theme.fg};
  }

  .store-icon {
    position: absolute;
    &:hover {
      cursor: pointer;
    }
  }

  .chrome-store-icon {
    top: 3px;
    right: 14px;
    width: 24px;
  }

  .edge-store-icon {
    top: 1px;
    right: 14px;
    width: 24px;
  }
`

export default Style
export { SearchStyle }
