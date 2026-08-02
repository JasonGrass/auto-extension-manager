import styled from "styled-components"

export const GroupContentStyle = styled.div`
  .search-sort-bar {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 10px;
  }

  .search {
    width: 300px;
  }

  .desc {
    margin: 20px 36px 20px 10px;
    padding-left: 5px;

    color: ${(props) => props.theme.fg6};
    font-size: 14px;
    line-height: 20px;

    border-left: 2px solid ${(props) => props.theme.border3};
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
    font-size: 18px;
    font-weight: 700;

    margin-bottom: 10px;
    padding-bottom: 5px;

    border-bottom: 1px solid ${(props) => props.theme.border};
  }
`
