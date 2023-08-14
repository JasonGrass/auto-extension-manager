import { styled } from "styled-components"

const Style = styled.div`
  display: flex;
  align-items: center;

  height: 42px;
  padding: 0px 5px;
  margin-bottom: 2px;
  background-color: #fff;
  box-shadow: 0px 0px 3px 1px rgba(0, 0, 0, 0.3);

  .left,
  .right {
    display: flex;
    align-items: center;
  }

  .left {
    flex-grow: 1;

    img {
      position: relative;
      bottom: 6px;
      right: 22px;
      width: 64px;
      height: 64px;
      margin-right: -18px;
    }
  }

  .right .ant-space {
    &:hover {
      color: #555;
    }
  }

  .right .dropdown {
    margin-left: 8px;
  }

  .right .search {
    font-size: 20px;
    margin: 0 8px;

    &:hover {
      color: #555;
    }
  }

  .right .setting {
    font-size: 20px;
    margin-right: 8px;

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
  input {
    width: 100%;
    height: 24px;

    margin: -1px -1px 0px 0px;

    outline-style: none;
    border: 1px solid #ccc;
    border-radius: 1px;

    &:focus {
      border-color: #66afe9;
      outline: 0;
      box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075), 0 0 4px rgba(102, 175, 233, 0.6);
    }
  }
`

export default Style
export { SearchStyle }
