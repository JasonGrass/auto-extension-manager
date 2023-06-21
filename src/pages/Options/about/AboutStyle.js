import styled from "styled-components"

export const AboutStyle = styled.div`
  .header-icon {
    display: flex;
    align-items: center;

    margin-top: 30px;
    margin-bottom: 50px;

    img {
      width: 64px;
      height: 64px;
    }

    .header-icon-text {
      margin-left: 8px;
      h3 {
        font-size: 18px;
        margin-bottom: 4px;
      }
      span {
        font-size: 14px;
      }
    }
  }

  .content-button {
    & > * {
      margin-right: 10px;
    }
  }

  .footer {
    display: flex;
    flex-direction: column;

    margin-top: 50px;

    span {
      font-size: 14px;
      margin-bottom: 10px;
    }

    a {
      color: #337ab7;
      font-size: 14px;
      text-decoration: none;

      &:hover {
        color: #23527c;
        text-decoration: underline;
      }
    }
  }
`
