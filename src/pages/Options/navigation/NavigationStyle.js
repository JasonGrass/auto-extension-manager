import styled from "styled-components"

export const NavigationStyle = styled.div`
  box-sizing: border-box;
  width: 224px;
  min-height: 100vh;
  padding: 24px 18px;

  a {
    text-decoration: none;
    color: ${(props) => props.theme.nav_link};
  }

  h1 {
    color: ${(props) => props.theme.fg2};
    margin: 0 10px 30px;
    font-size: 18px;
    font-weight: 700;
    line-height: 1.4;
    letter-spacing: -0.4px;

    &:hover {
      color: ${(props) => props.theme.nav_link};
    }
  }

  .nav-item {
    display: block;
    min-height: 40px;

    margin-bottom: 6px;
    padding: 10px 12px;

    font-size: 14px;
    line-height: 20px;
    color: ${(props) => props.theme.fg4};

    border-radius: 7px;
    transition:
      color 0.16s ease,
      background-color 0.16s ease;

    &:hover {
      background-color: ${(props) => props.theme.nav_hover_bg};
      color: ${(props) => props.theme.nav_link};
    }

    &.active {
      background-color: ${(props) => props.theme.primary_soft};
      color: ${(props) => props.theme.nav_link};
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
  a:focus-visible {
    outline: 2px solid ${(props) => props.theme.nav_link};
    outline-offset: 2px;
  }

  @media (max-width: 760px) {
    width: 100%;
    min-height: 0;
    padding: 16px;
    display: flex;
    flex-wrap: wrap;
    gap: 4px;

    > a:first-child {
      flex-basis: 100%;
    }

    h1 {
      margin: 0 8px 12px;
    }

    .nav-item {
      margin-bottom: 0;
    }
  }
`
