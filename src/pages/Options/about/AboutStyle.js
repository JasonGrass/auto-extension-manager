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

    .version {
      font-size: 14px;
      margin-bottom: 10px;
    }

    .ant-tag-has-color {
      padding: 0px 5px 1px 5px;
    }

    .badges-tag {
      &:hover {
        cursor: pointer;
      }
    }
  }

  .footer-storage {
    /* display: inline-flex; */
    display: none;
    align-items: center;

    margin-top: 20px;
    padding-top: 5px;
    border-top: 1px solid #ccc;

    .storage-detail-tip-icon {
      margin-left: 5px;
      &:hover {
        color: #888;
      }
    }
  }
`
