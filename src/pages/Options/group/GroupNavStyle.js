import styled from "styled-components"

export const GroupNavStyle = styled.div`
  .tab-container {
    display: flex;
    align-items: center;

    height: 48px;

    margin-bottom: 10px;
    padding: 0 5px 0 10px;

    // border: 1px solid #337ab7;
    border-radius: 5px;
    box-shadow: ${(props) => props.theme.card_shadow};

    user-select: none;

    &:hover {
      background-color: ${(props) => props.theme.primary_soft};
    }

    &:hover .tab-operation {
      display: block;
    }

    h3 {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .tab-container .tab-operation {
    flex: 0 0 auto;
    display: none;
    color: ${(props) => props.theme.nav_link_hover};
    font-size: 18px;
  }

  .tab-operation-item {
    margin: 0 5px;
  }

  .selected-group-item {
    background: ${(props) => props.theme.primary_soft_strong};
    color: ${(props) => props.theme.primary};
  }

  .add-new-group {
    color: ${(props) => props.theme.nav_link_hover};
    font-size: 18px;
    justify-content: center;
  }

  .tab-container h3 {
    flex-grow: 1;
  }
`
