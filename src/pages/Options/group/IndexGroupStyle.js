import styled from "styled-components"

export const GroupStyle = styled.div`
  padding-bottom: 24px;

  .group-edit-box {
    display: flex;
    flex-wrap: wrap;
    gap: 24px;
  }

  .left-box {
    width: 200px;
    flex-shrink: 0;
  }

  .right-box {
    flex: 1 1 320px;
    min-width: 0;
  }

  .group-not-include-filter {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 12px;

    margin: 0;
    padding: 12px;

    border-radius: 8px;
    border: 1px solid ${(props) => props.theme.border};
    background: ${(props) => props.theme.surface};
  }
`
