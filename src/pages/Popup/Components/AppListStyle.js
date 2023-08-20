import styled from "styled-components"

export const AppListStyle = styled.div`
  ul {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;

    i {
      width: 42px;
      margin: 0px 10px;
    }
  }

  li {
    margin: 12px 10px;
    width: 42px;
  }

  .ext-item {
    text-align: center;
  }

  li img {
    display: block;
    width: 42px;
    height: 42px;
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
