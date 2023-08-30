import { styled } from "styled-components"

const Style = styled.div`
  .ant-table-wrapper {
    margin-right: 5px;
  }

  .column-index {
    display: inline-block;
    width: 100%;
    text-align: center;
  }

  .column-name {
    display: flex;
    align-items: center;

    img {
      margin-right: 5px;
    }
  }

  .ant-table-expanded-row .ant-table-cell {
    padding-bottom: 2px;
  }
`

export default Style
