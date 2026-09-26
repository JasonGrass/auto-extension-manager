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
      margin-left: 20px;
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

    .version {
      font-size: 14px;
      margin-bottom: 12px;
    }

    .version-update {
      width: 500px;
      max-width: 100%;
      margin-bottom: 12px;
    }

    .badges-tag {
      color: ${(props) => props.theme.nav_link};
      background: ${(props) => props.theme.primary_soft};
      border-color: ${(props) => props.theme.input_border};
      cursor: pointer;

      &:hover {
        color: ${(props) => props.theme.nav_link_hover};
        background: ${(props) => props.theme.primary_soft_strong};
        border-color: ${(props) => props.theme.nav_link};
      }
    }
  }

  .footer-storage {
    display: inline-flex;
    align-items: center;

    margin-top: 20px;
    padding-top: 5px;
    border-top: 1px solid ${(props) => props.theme.border3};

    .storage-detail-tip-icon {
      margin-left: 5px;
      &:hover {
        color: ${(props) => props.theme.fg6};
      }
    }
  }
`
