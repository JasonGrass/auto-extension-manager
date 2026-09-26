import styled from "styled-components"

export const SettingStyle = styled.div`
  width: 100%;
  max-width: 840px;
  padding-bottom: 24px;

  .setting-card {
    margin-bottom: 24px;
    padding: 20px 24px 8px;
    background: ${(props) => props.theme.surface};
    border: 1px solid ${(props) => props.theme.border};
    border-radius: 8px;
  }

  .setting-section-title {
    margin: 0 0 8px;
    color: ${(props) => props.theme.fg};
    font-size: 16px;
    line-height: 24px;
    font-weight: 600;
  }

  .setting-subgroup-title {
    margin: 16px 0 0;
    padding-top: 16px;
    border-top: 1px solid ${(props) => props.theme.border};
    color: ${(props) => props.theme.fg4};
    font-size: 13px;
    line-height: 20px;
    font-weight: 600;
  }

  .setting-item {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 12px 24px;
    min-height: 52px;
    padding: 12px 0;
    box-sizing: border-box;
    font-size: 14px;
    line-height: 22px;

    > span:first-child,
    > .setting-label {
      flex: 1 1 260px;
      min-width: 0;
      overflow-wrap: anywhere;
    }

    > :not(:first-child) {
      flex-shrink: 0;
      max-width: 100%;
      margin-left: auto;
    }

    .anticon {
      margin-left: 6px;
      color: ${(props) => props.theme.fg4};
    }

    .ant-radio-group {
      display: flex;
      flex-wrap: wrap;
      gap: 4px 8px;
    }

    .ant-segmented-item-label {
      white-space: normal;
    }

    .search-source-dropdown {
      width: auto;
    }
  }

  .setting-description {
    display: block;
    margin: 4px 0 0;
    color: ${(props) => props.theme.fg4};
    font-size: 13px;
    line-height: 20px;
    font-weight: 400;
  }

  .setting-dependent {
    margin: 0 0 8px 16px;
    padding: 0 16px;
    border-left: 2px solid ${(props) => props.theme.border3};
    border-radius: 0 6px 6px 0;
    background: ${(props) => props.theme.bg};
  }

  .setting-slider {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 196px;

    .ant-slider {
      flex: 1;
      min-width: 80px;
      margin: 10px 6px;
    }

    output {
      min-width: 40px;
      text-align: right;
      font-variant-numeric: tabular-nums;
    }
  }

  .setting-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    padding: 12px 0;
  }

  @media (max-width: 600px) {
    .setting-card {
      padding: 16px 16px 8px;
    }

    .setting-dependent {
      margin-left: 8px;
      padding: 0 12px;
    }
  }
`
