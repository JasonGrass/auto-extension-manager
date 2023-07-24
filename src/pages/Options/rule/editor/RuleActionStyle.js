import { styled } from "styled-components"

const Style = styled.div`
  .action-container {
    display: flex;
    flex-direction: column;
    align-items: flex-start;

    margin: 10px 0;

    & > * {
      margin: 0 0 10px 0;
    }
  }
`

export default Style
