import styled from "styled-components"

export const GroupNavStyle = styled.div`
  .tab-container {
    display: flex;
    align-items: center;

    height: 48px;
    width: 100%;
    text-align: left;
    color: inherit;
    cursor: pointer;

    margin-bottom: 10px;
    padding: 0 5px 0 10px;

    border: 1px solid ${(props) => props.theme.border};
    border-radius: 8px;
    background: ${(props) => props.theme.surface};

    user-select: none;

    &:hover {
      background-color: ${(props) => props.theme.primary_soft};
    }

    &:focus-visible {
      outline: 2px solid ${(props) => props.theme.nav_link};
      outline-offset: 2px;
    }

    span {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .selected-group-item {
    background: ${(props) => props.theme.primary_soft};
    color: ${(props) => props.theme.nav_link};
  }
`
