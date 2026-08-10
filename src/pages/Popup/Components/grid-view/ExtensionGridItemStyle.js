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
    margin-top: 4px;
    color: ${(props) => props.theme.enable_text};

    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    user-select: none;
  }

  .grid-name-tooltip {
    display: none;
    position: fixed;
    z-index: 99999;

    max-width: 300px;
    padding: 4px 8px;

    font-size: 12px;
    line-height: 1.4;
    color: ${(props) => props.theme.on_accent};
    background-color: ${(props) => props.theme.tooltip_bg};
    border-radius: 6px;
    white-space: normal;
    word-break: break-word;
    pointer-events: none;
    user-select: none;

    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  }

  .grid-name-tooltip-show {
    display: block;
  }

  .tooltip-arrow {
    position: absolute;
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    transform: translateX(-50%);
  }

  .tooltip-arrow-top {
    top: -4px;
    border-bottom: 4px solid ${(props) => props.theme.tooltip_bg};
  }

  .tooltip-arrow-bottom {
    bottom: -4px;
    border-top: 4px solid ${(props) => props.theme.tooltip_bg};
  }

  .grid-display-item-title-gray {
    color: ${(props) => props.theme.disable_text};
  }

  .item-pined-dot {
    position: absolute;
    top: -1px;
    right: -1px;

    width: 12px;
    height: 12px;
    margin: 0;

    border: 3px solid ${(props) => props.theme.fg6};
    border-radius: 6px;
    box-shadow: 0 0 0 1px ${(props) => props.theme.pin_ring};

    background-color: ${(props) => props.theme.pin_dot};
  }

  .operation-menu {
    display: none;
    position: absolute;
    width: 160px;
    height: 70px;

    z-index: 1000;

    border-radius: 7px;
    background-color: ${(props) => props.theme.operation_bg};

    box-shadow: 0 6px 18px ${(props) => props.theme.operation_shadow};
  }

  /* 扩展禁用时，hover 菜单的样式 */
  .operation-menu-disable {
    filter: grayscale(70%);
  }

  .operation-menu-title {
    padding: 8px 12px;
    color: ${(props) => props.theme.on_accent};
    text-align: center;

    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    border-radius: 4px 4px 0px 0px;
    background-color: ${(props) => props.theme.operation_title_bg};
  }

  .operation-menu-items {
    display: flex;
    align-items: center;
    justify-content: space-around;

    margin-top: 5px;
    padding: 2px 6px;

    font-size: 22px;
    color: ${(props) => props.theme.on_accent};
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
    color: ${(props) => props.theme.disable_text};
  }

  .operation-menu-item {
    font-size: 20px;

    &:hover {
      transform: scale(1.2);
      color: ${(props) =>
        props.theme.isDark ? props.theme.primary_hover : props.theme.on_accent};
      text-shadow: none;
    }
  }

  .grid-item-disable {
    filter: grayscale(100%) opacity(50%);
  }
`
