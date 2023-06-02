import styled from "styled-components"

export const GroupStyle = styled.div`
  position: relative;
  height: 100%;

  .group-edit-box {
    display: flex;
  }

  .left-box {
    width: 200px;
    flex-shrink: 0;

    /* background: linear-gradient(to right, #fff, #337ab788); */
  }

  .right-box {
    flex-grow: 1;
    margin-left: 10px;
  }

  .right-box .desc {
    font-size: 14px;
    word-break: break-all;
  }

  .right-box h3 {
    margin-bottom: 10px;
    padding-bottom: 5px;

    font-size: 18px;
    font-weight: 700;

    border-bottom: 1px solid #eee;
  }

  .right-box ul {
    display: flex;
    flex-wrap: wrap;
  }

  .view-hidden {
    display: none;
  }

  .ext-item {
    display: flex;
    flex-direction: column;
    align-items: center;

    width: 100px;
    margin-bottom: 20px;
  }

  .ext-item img {
    width: 32px;
    height: 32px;
  }

  .ext-item span {
    width: 100%;

    margin-top: 5px;

    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-align: center;
  }

  .scene-edit-panel {
    position: absolute;
    margin-top: 60px;
    top: 0px;
    left: 0px;
    right: 0px;
    height: calc(100% - 60px);
  }
`
