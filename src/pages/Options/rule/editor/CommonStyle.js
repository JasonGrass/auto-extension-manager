import { styled } from "styled-components"

const EditorCommonStyle = styled.div`
  margin-bottom: 24px;

  .editor-step-header {
    position: relative;

    height: 36px;

    &:after {
      content: "";
      display: block;
      width: 100%;
      height: 3px;
      margin: 5px 0;

      background: ${(props) => props.theme.primary};
    }

    .title {
      font-size: 18px;
      font-weight: bold;
      color: ${(props) => props.theme.fg2};
    }
  }
`

export default EditorCommonStyle
