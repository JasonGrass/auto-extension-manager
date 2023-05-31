import styled from "styled-components"

export const AppListStyle = styled.div`
  padding: 0 5px;

  ul {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
  }

  li {
    margin: 2px;
    width: 40px;
  }

  .ext-item {
    text-align: center;
  }

  li img {
    display: block;
    width: 24px;
    height: 24px;
    margin: 0 auto;
  }

  li span {
    display: block;
    margin: 2px auto 0px auto;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .not-enable {
    color: #cccccc;
  }
`
