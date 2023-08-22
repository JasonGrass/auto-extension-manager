import styled from "styled-components"

const imgSize = "46px"
const imgMargin = "16px"

export const AppListStyle = styled.div`
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
  }

  li img {
    display: block;
    width: ${imgSize};
    height: ${imgSize};
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
