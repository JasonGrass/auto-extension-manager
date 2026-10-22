import styled from "styled-components"

const imgSize = "46px"
const imgMargin = "16px"

export const AppListStyle = styled.div`
  .app-group-name {
    display: flex;
    align-items: center;
    margin: 12px 8px;
    font-size: inherit;
    font-weight: normal;
    color: ${(props) => props.theme.fg};

    &::before,
    &::after {
      content: "";
      border-bottom: 1px solid ${(props) => props.theme.input_border};
    }

    &::before {
      width: 20px;
      margin-right: 8px;
    }

    &::after {
      flex: 1;
      margin-left: 8px;
    }
  }

  ul {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;

    i {
      width: ${imgSize};
      margin: 0px ${imgMargin};
    }
  }

  li {
    margin: 12px ${imgMargin};
    width: 42px;
  }

  .ext-item {
    text-align: center;
    color: ${(props) => props.theme.enable_text};
  }

  li img {
    display: block;
    width: ${imgSize};
    height: ${imgSize};
    margin: 0 auto;
    cursor: pointer;
  }

  li span {
    display: block;
    margin: 2px auto 0px auto;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .not-enable {
    color: ${(props) => props.theme.disable_text};
  }

  &.app-list {
    ul {
      display: block;
      margin: 0;
    }

    .ext-item {
      display: flex;
      align-items: center;
      gap: 16px;
      width: auto;
      margin: 0 8px 1px;
      padding: 6px 8px;
      text-align: left;
    }

    li img {
      width: 32px;
      height: 32px;
      margin: 0;
    }

    li span {
      flex: 1;
      min-width: 0;
      margin: 0;
    }
  }
`
