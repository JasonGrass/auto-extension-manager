import styled from "styled-components"

export const NavigationStyle = styled.div`
  box-sizing: border-box;
  width: 248px;
  min-height: 100vh;
  padding: 24px 18px;

  a {
    text-decoration: none;
    color: ${(props) => props.theme.nav_link};
  }

  h1 {
    color: ${(props) => props.theme.fg2};
    margin: 0 10px 30px;
    font-size: 22px;
    font-weight: 750;
    letter-spacing: -0.4px;

    &:hover {
      color: ${(props) => props.theme.primary};
    }
  }

  .nav-item {
    display: block;
    height: 40px;

    margin-bottom: 6px;
    padding: 0 12px;

    font-size: 14px;
    line-height: 40px;
    color: ${(props) => props.theme.fg4};

    border-radius: 7px;
    transition:
      color 0.16s ease,
      background-color 0.16s ease;

    &:hover {
      background-color: ${(props) => props.theme.nav_hover_bg};
      color: ${(props) => props.theme.primary};
    }

    &.active {
      background-color: ${(props) => props.theme.primary_soft_strong};
      color: ${(props) => props.theme.primary};
      font-weight: 600;
    }

    & > .anticon {
      position: relative;
      top: 1px;
    }

    & > .text {
      margin-left: 8px;
    }
  }
`
