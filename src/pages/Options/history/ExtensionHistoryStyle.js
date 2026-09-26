import { styled } from "styled-components"

const Style = styled.div`
  .history-manage-tools {
    display: flex;
    flex-wrap: wrap;
    gap: 12px 16px;
    align-items: baseline;
    justify-content: space-between;

    margin-bottom: 16px;
  }

  .history-manage-tools-left {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    min-width: 0;
    align-items: baseline;

    .search {
      width: 300px;
      max-width: 100%;
    }
  }

  .history-manage-tools-right {
    margin-left: auto;

    display: flex;
    flex-wrap: wrap;
    gap: 12px;
  }

  .setting-operation-item {
    margin: 0;
  }

  .ant-table-wrapper {
    width: 100%;
    min-width: 0;
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
    color: ${(props) => props.theme.nav_link};

    & > .ant-space:nth-child(1) {
      margin-right: 12px;
    }

    :hover {
      color: ${(props) => props.theme.nav_link_hover};
    }
  }

  .column-remark-link {
    margin: 0 0.2rem;
  }
`

export default Style
