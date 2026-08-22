import { styled } from "styled-components"

export const ExtensionManageStyle = styled.div`
  width: 100%;
  min-width: 0;

  .extension-manage-tools {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
    gap: 10px 16px;
    margin-bottom: 10px;
  }

  .extension-manage-tools-left {
    display: flex;
    flex: 1 1 520px;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px;
    min-width: 0;

    .search {
      width: 300px;
      max-width: 100%;
    }

    .group-filter {
      width: 180px;
      max-width: 100%;
    }

    .settings-checkbox {
      margin: 0;
    }

    .show-operation-checkbox {
      margin-left: 10px;
    }
  }

  .extension-manage-tools-right {
    display: flex;
    flex: 0 0 auto;
    align-items: center;
    gap: 12px;
    margin-left: auto;
    margin-right: 5px;

    & > a {
      min-width: 0;
    }
  }

  .ant-table-wrapper {
    width: 100%;
    max-width: 100%;
    min-width: 0;
  }

  .ant-table-cell {
    overflow-wrap: anywhere;
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

  /* 控制文本换行最多不超过2行 */
  .text-wrap-max-two-line {
    min-width: 60px;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }
`
