import { styled } from "styled-components"

export const ExtensionGridItemStyle = styled.div`
  position: relative;

  img {
    width: 42px;
    height: 42px;
    user-select: none;
  }

  .grid-display-item {
    position: relative;

    transition: transform 0.3s ease;
  }

  .grid-display-item-scale {
    transform: scale(1.2);
  }

  .grid-display-item-box {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .grid-display-item-title {
    max-width: 66px;
    min-height: 16px;
    margin-top: 4px;
    color: ${(props) => props.theme.enable_text};

    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    user-select: none;
  }

  .grid-display-item-title-gray {
    color: ${(props) => props.theme.disable_text};
  }

  .drag-icon-with-name-show {
    position: relative;
    margin-top: 4px;
    min-height: 16px;
  }

  .drag-icon-without-name-show {
    position: absolute;
    bottom: 0px;
  }

  .grid-display-item .DragHandle {
    padding: 0px;
    background-color: transparent;
  }

  .drag-icon-svg {
    width: 16px;
    fill: ${(props) => props.theme.enable_text};
  }

  .item-pined-dot {
    position: absolute;
    top: -1px;
    right: -1px;

    width: 12px;
    height: 12px;
    margin: 0;

    border: 3px solid #888;
    border-radius: 6px;
    box-shadow: 0 0 0px 1px #fff;

    background-color: #3ffa7b;
  }

  .operation-menu {
    display: none;
    position: absolute;
    width: 160px;
    height: 70px;

    z-index: 1000;

    border-radius: 4px;
    background-color: #24bfc4;

    box-shadow: #24c1c0 0px 1px 4px;
  }

  /* 扩展禁用时，hover 菜单的样式 */
  .operation-menu-disable {
    filter: grayscale(70%);
  }

  .operation-menu-title {
    padding: 8px 12px;
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
    padding: 2px 6px;

    font-size: 22px;
    color: #fff;
  }

  .menu-on {
    display: block;
  }

  @keyframes menu-right-in {
    0% {
      opacity: 0;
      transform: translateX(-5%);
    }

    100% {
      opacity: 1;
      transform: translateX(0%);
    }
  }

  @keyframes menu-left-in {
    0% {
      opacity: 0;
      transform: translateX(5%);
    }

    100% {
      opacity: 1;
      transform: translateX(0%);
    }
  }

  .menu-right {
    opacity: 0;
    top: -10px;
    left: 58px;

    animation: menu-right-in 0.2s ease-out ${(props) => props.animation_delay}s forwards;
  }

  .menu-left {
    opacity: 0;
    top: -10px;
    right: 58px;

    animation: menu-left-in 0.2s ease-out ${(props) => props.animation_delay}s forwards;
  }

  .operation-menu-item-disabled {
    color: #ccc;
  }

  .operation-menu-item {
    font-size: 20px;

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
