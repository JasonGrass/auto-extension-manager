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
    box-shadow: 1px 1px 4px 0px #337ab788;

    &:hover {
      background-color: #337ab7cc;
    }

    &:hover .tab-operation {
      display: block;
    }
  }

  .tab-container .tab-operation {
    display: none;
    color: #23527c;
    font-size: 18px;
  }

  .tab-operation-item {
    margin: 0 5px;
  }

  .selected-group-item {
    background: #337ab788;
  }

  .add-new-group {
    color: #23527c;
    font-size: 18px;
    justify-content: center;
  }

  .tab-container h3 {
    flex-grow: 1;
  }
`
