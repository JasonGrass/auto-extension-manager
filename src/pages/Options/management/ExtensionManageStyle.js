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

  .ant-table-expanded-row .ant-table-cell {
    padding-top: 4px;
    padding-bottom: 4px;
  }

  .ant-form-item {
    margin-bottom: 8px;
  }
`
