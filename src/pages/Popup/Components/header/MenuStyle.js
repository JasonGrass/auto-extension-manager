import styled from "styled-components"

export const MenuStyle = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  width: 100px;
  height: 30px;

  font-size: 14px;
  text-align: center;
  background-color: ${(props) => props.theme.btn_bg};
  border-radius: 4px;

  &:hover {
    background-color: ${(props) => props.theme.btn_hover_bg};
  }

  .content {
    margin-bottom: -3px;
  }

  .caret {
    position: relative;
    font-size: 10px;
    left: 3px;
    top: -4px;
  }
`
