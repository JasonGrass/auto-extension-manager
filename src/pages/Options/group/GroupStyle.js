import styled from "styled-components"

export const GroupStyle = styled.div`
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

  .tab-container {
    display: flex;
    align-items: center;

    height: 48px;

    /* margin-bottom: 10px; */
    padding: 0 5px 0 10px;

    background: linear-gradient(to right, #fff, #337ab788);
    border-radius: 5px 0 0 5px;

    &:hover {
      background-color: #337ab7;
    }

    &:hover .tab-operation {
      display: block;
    }
  }

  .tab-container .tab-operation {
    display: none;
    color: #23527c;
    font-size: 18px;
  }

  .tab-operation-item {
    margin: 0 5px;
  }

  .selected-group-item {
    background: linear-gradient(to left, #fff, #337ab788);
  }

  .add-new-group {
    color: #23527c;
    font-size: 18px;
    justify-content: center;
  }

  .tab-container h3 {
    flex-grow: 1;
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
`
