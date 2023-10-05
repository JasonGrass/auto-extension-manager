import styled from "styled-components"

export const GroupContentStyle = styled.div`
  .search {
    width: 300px;
    margin-bottom: 10px;
  }

  .desc {
    margin: 20px 36px 0 10px;
    padding-left: 5px;

    color: #888;
    font-size: 14px;
    line-height: 20px;

    border-left: 2px solid #cccccc;
  }

  .other-group-info-container {
    margin: -16px 0 0 0;
  }

  .other-group-info-name {
    margin: 1px 0;
    padding: 2px 4px;
    color: #666;
    border-radius: 2px;
    background-color: #ddd;
  }

  .group-name-title {
    font-size: 18px;
    font-weight: 700;
  }

  .group-include-title {
    margin-bottom: 10px;
    padding-bottom: 5px;

    border-bottom: 1px solid #eee;
  }

  .group-not-include-title {
  }

  .group-not-include-header {
    display: flex;
    align-items: baseline;

    margin-top: 24px;
    margin-bottom: 10px;
    padding-bottom: 5px;
    border-bottom: 1px solid #eee;

    & > * {
      margin-right: 16px;
    }
  }
`

export const AlreadyFixedTipStyle = styled.div`
  .btn-already-fixed-tip {
    margin-right: 10px;
  }
`
