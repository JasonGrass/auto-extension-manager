import { styled } from "styled-components"

export const ExtensionGridItemStyle = styled.div`
  position: relative;

  img {
    width: 42px;
    height: 42px;
  }

  .grid-display-item {
    transition: transform 0.3s ease;

    &:hover {
      transform: scale(1.2);
    }
  }

  .operation-menu {
    display: none;
    position: absolute;
    width: 130px;
    height: 64px;

    z-index: 1000;

    border-radius: 4px;
    background-color: #24bfc4;

    box-shadow: #24c1c0 0px 1px 4px;
  }

  .operation-menu-title {
    padding: 5px;
    color: #fff;
    text-align: center;

    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    border-radius: 4px 4px 0px 0px;
    background-color: #27b0d4;
  }

  .operation-menu-items {
    display: flex;
    align-items: center;
    justify-content: space-around;

    margin-top: 5px;

    font-size: 22px;
    color: #fff;
  }

  .menu-on {
    display: block;
  }

  @keyframes menu-right-in {
    0% {
      opacity: 0;
      transform: translateX(10%);
    }

    100% {
      opacity: 1;
      transform: translateX(0%);
    }
  }

  @keyframes menu-left-in {
    0% {
      opacity: 0;
      transform: translateX(-10%);
    }

    100% {
      opacity: 1;
      transform: translateX(0%);
    }
  }

  .menu-right {
    opacity: 0;
    top: -10px;
    left: 48px;

    animation: menu-right-in 0.3s ease-out 0.15s forwards;
  }

  .menu-left {
    opacity: 0;
    top: -10px;
    right: 48px;

    animation: menu-left-in 0.3s ease-out 0.15s forwards;
  }

  .operation-menu-item-disabled {
    color: #ccc;
  }

  .operation-menu-item {
    &:hover {
      transform: scale(1.2);
      color: #346dbc;
      text-shadow: 2px 2px 4px #24bfc4;
    }
  }

  .grid-item-disable {
    filter: grayscale(100%) opacity(50%);

    &:hover {
      filter: none;
    }
  }
`
