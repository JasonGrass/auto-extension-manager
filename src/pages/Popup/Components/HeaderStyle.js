import { styled } from "styled-components"

const Style = styled.div`
  display: flex;
  align-items: center;

  height: 38px;
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

  .right .caret {
    position: relative;
    font-size: 10px;
    left: -7px;
    top: -1px;
  }

  .right .dropdown {
    margin-left: 8px;
  }

  .right .search {
    font-size: 18px;
    margin: 0 8px;

    &:hover {
      color: #555;
    }
  }

  .right .setting {
    font-size: 18px;
    margin-right: 8px;

    &:hover {
      color: #555;
    }
  }
`

export default Style
