import { styled } from "styled-components"

export const ExtensionManageStyle = styled.div`
  .extension-manage-tools {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
  }

  .extension-manage-tools-left {
    display: flex;
    align-items: baseline;

    .search {
      width: 300px;
      margin-right: 10px;
    }

    .settings-checkbox {
      margin: 0 0 0 10px;
    }
  }

  .extension-manage-tools-right {
    display: flex;
    align-items: baseline;

    margin-right: 24px;

    & > a {
      margin-right: 12px;
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

  .column-hidden {
    display: none;
  }
`
