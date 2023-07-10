import styled from "styled-components"

export const SettingStyle = styled.div`
  .container {
    width: 500px;

    background-color: #eee;

    border: 1px solid #ddd;
    border-radius: 5px;
  }

  .setting-item {
    display: flex;
    align-items: center;
    margin: 5px 10px;
    padding: 5px 0 8px 0;

    border-bottom: 1px solid #ccc;

    span {
      flex: 1 1 auto;
      font-size: 12px;
      font-weight: bold;
    }
  }

  .setting-width {
    display: none;
  }
`
