import styled from "styled-components"

export const NavigationStyle = styled.div`
  margin-top: 10px;
  margin-left: 20px;
  width: 280px;

  a {
    text-decoration: none;
    color: #337ab7;
  }

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

  .nav-item {
    display: block;
    height: 36px;

    margin-bottom: 6px;
    padding-left: 10px;

    font-size: 14px;
    line-height: 36px;
    color: #337ab7;

    border-radius: 4px;

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
