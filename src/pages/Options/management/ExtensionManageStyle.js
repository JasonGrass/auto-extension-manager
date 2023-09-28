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

    .column-name-title {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .column-name-channel {
      position: relative;
      left: 5px;

      padding: 1px 5px;
      font-size: 12px;
      border-radius: 5px;
      background-color: #73d13d33;
    }

    .column-name-channel-Edge {
      background-color: #40a9ff33;
    }

    .column-name-channel-Chrome {
      background-color: #ffa94033;
    }

    .column-name-channel-Development {
      background-color: #ff4d4f33;
    }
  }

  .ant-table-expanded-row .ant-table-cell {
    padding-top: 4px;
    padding-bottom: 4px;
  }

  .ant-form-item {
    margin-bottom: 8px;
  }
`
