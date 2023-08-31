import { styled } from "styled-components"

const Style = styled.div`
  .history-manage-tools {
    display: flex;
    align-items: baseline;
    justify-content: space-between;

    margin-bottom: 10px;
  }

  .history-manage-tools-left {
    display: flex;
    align-items: baseline;

    .search {
      width: 300px;
      margin-right: 10px;
    }
  }

  .history-manage-tools-right {
    margin: 0 20px 0 0;
  }

  .setting-operation-item {
    margin: 0 0 0 10px;
  }

  .ant-table-wrapper {
    margin-right: 5px;
  }

  .column-index {
    display: inline-block;
    width: 100%;
    padding-left: 2px;
  }

  .column-name {
    display: inline-block;
    position: relative;
    width: 100%;
  }

  .column-name-title {
    display: flex;
    align-items: center;

    img {
      margin-right: 5px;
    }
  }

  .column-name:hover .column-name-solo {
    display: block;
  }

  .column-name-solo {
    display: none;
    position: absolute;
    top: -2px;
    right: 2px;
    font-size: 16px;
    color: #337ab7;

    :hover {
      color: #9e1068;
    }
  }

  .column-remark-link {
    margin: 0 0.2rem;
  }
`

export default Style
