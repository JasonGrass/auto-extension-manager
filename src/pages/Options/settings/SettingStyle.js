import styled from "styled-components"

export const SettingStyle = styled.div`
  .container {
    width: 660px;

    background: linear-gradient(to right, #337ab7aa, #fff);

    border: 1px solid #ddd;
    border-radius: 5px;
  }

  .setting-sub-title {
    margin: 10px 0;
    font-size: 18px;
    font-weight: bold;
    color: #333;
  }

  .setting-space-title {
    margin: 12px 0px 4px 0px;

    &::before {
      content: "--";
      color: #777;
      padding: 0 8px;
    }

    &::after {
      content: "--";
      color: #777;
      padding: 0 8px;
    }
  }

  .setting-item {
    display: flex;
    align-items: center;
    margin: 5px 10px;
    padding: 5px 0 8px 0;

    border-bottom: 1px solid #eee6;

    span {
      flex: 1 1 auto;
      font-size: 14px;
    }

    span.anticon {
      padding-top: 1px;
      margin-left: 4px;
    }
  }

  .import-export-container {
    margin-top: 20px;
    & > button {
      margin-right: 10px;
    }
  }
`
