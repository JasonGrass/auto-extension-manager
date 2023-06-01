import styled from "styled-components"

export const NavigationStyle = styled.div`
  margin-top: 10px;
  margin-left: 20px;
  width: 280px;

  h1 {
    color: #337ab7;
    margin-bottom: 30px;
    font-size: 24px;
    font-weight: 700;

    &:hover {
      color: #23527c;
      text-decoration: underline;
    }
  }

  ul {
    font-size: 14px;
    color: #337ab7;
  }

  li {
    height: 36px;
    line-height: 36px;
    margin-bottom: 6px;
    border-radius: 4px;

    padding-left: 10px;

    &:hover {
      background-color: #eee;
    }

    &.active {
      background-color: #337ab7;
      color: #fff;
    }

    & > .anticon {
      position: relative;
      top: 1px;
    }

    & > .text {
      margin-left: 5px;
    }
  }
`
