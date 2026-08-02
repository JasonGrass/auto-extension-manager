import React from "react"

import styled from "styled-components"

/**
 * 模态编辑高阶组件
 */
function ModalEditorWrapper(props) {
  return (
    <Style>
      <div className="modal-editor-wrapper-container">
        <h3>{props.title}</h3>
        <hr />
        {props.children}
      </div>
    </Style>
  )
}

export default ModalEditorWrapper

const Style = styled.div`
  &::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: ${(props) => props.theme.modal_overlay};
  }

  .modal-editor-wrapper-container {
    width: 600px;
    margin: 50px auto;
    padding: 20px;
    position: relative;
    z-index: 1;

    & > h3 {
      font-weight: 700;
      font-size: 15px;
      color: ${(props) => props.theme.fg2};
    }

    & > hr {
      border: 1px solid ${(props) => props.theme.border3};
      margin: 10px -5px;
    }

    &::after {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: ${(props) => props.theme.surface_elevated};
      border: 1px solid ${(props) => props.theme.border2};
      border-radius: 8px;
      box-shadow: ${(props) => props.theme.card_shadow};
      z-index: -1;
    }
  }
`
