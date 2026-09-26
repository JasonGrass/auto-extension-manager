import styled from "styled-components"

export const GroupContentStyle = styled.div`
  .group-detail-header {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 1px solid ${(props) => props.theme.border};
  }

  .group-detail-title {
    flex: 1 1 240px;
    min-width: 0;
    overflow-wrap: anywhere;

    margin: 0;
    font-size: 20px;
    line-height: 28px;
    font-weight: 600;
    color: ${(props) => props.theme.fg};
  }

  .group-detail-actions {
    display: flex;
    flex-shrink: 0;
    gap: 8px;
  }

  .search-sort-bar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
  }

  .search {
    width: 300px;
    max-width: 100%;
  }

  .desc {
    margin: 24px 0;
    padding-top: 16px;
    border-top: 1px solid ${(props) => props.theme.border};
    color: ${(props) => props.theme.fg3};
    font-size: 13px;
    line-height: 22px;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }

  .other-group-info-container {
    margin: -16px 0 0 0;
  }

  .other-group-info-name {
    margin: 1px 0;
    padding: 2px 4px;
    color: ${(props) => props.theme.group_other_color};
    border-radius: 2px;
    background-color: ${(props) => props.theme.group_other_bg};
  }

  .group-name-title {
    font-size: 16px;
    font-weight: 600;

    margin-bottom: 10px;
    padding-bottom: 5px;

    border-bottom: 1px solid ${(props) => props.theme.border};
  }
`
