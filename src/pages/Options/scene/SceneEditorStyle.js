import styled from "styled-components"

export const SceneEditorStyle = styled.div`
  &::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #888a;
    filter: blur(1px);
  }

  .scene-editor-container {
    width: 600px;
    margin: 50px auto;
    padding: 20px;
    position: relative;
    z-index: 1;

    & > h3 {
      font-weight: 700;
      font-size: 15px;
      color: #333;
    }

    & > hr {
      border: 1px solid #ccc;
      margin: 10px -5px;
    }

    &::after {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(255, 255, 255, 0.8);
      border-radius: 6px;
      filter: blur(1px);
      z-index: -1;
    }
  }
`
