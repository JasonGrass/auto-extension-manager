import { styled } from "styled-components"

export const ExtensionManageStyle = styled.div`
  .extension-manage-tools {
    display: flex;
    align-items: baseline;
    margin-bottom: 10px;

    .search {
      width: 300px;
      margin-right: 10px;
    }

    .search-checkbox {
      margin: 0 0 0 10px;
    }
  }

  .ant-table-wrapper {
    margin-right: 5px;
  }

  .column-index {
    display: inline-block;
    width: 100%;
    text-align: center;
  }

  .column-name {
    display: flex;
    align-items: center;

    img {
      margin-right: 5px;
    }
  }

  .ant-table-expanded-row .ant-table-cell {
    padding-bottom: 2px;
  }
`
