import styled from "styled-components"

export const SceneStyle = styled.div`
  position: relative;
  height: 100%;

  .current-active-scene-title {
    font-size: 16px;
    color: #555;
  }

  .scene-item-container {
    max-width: 800px;

    margin: 24px 0;

    user-select: none;
  }

  .scene-item {
    position: relative;
    display: flex;
    align-items: center;

    padding: 4px 8px;
    margin: 4px 4px 4px 0px;

    /* border: 1px solid #ccca;
    border-radius: 4px; */
    /* box-shadow: 1px 1px 4px 0px #337ab788; */

    /* &:hover {
      background-color: #337ab7cc;
    } */

    h3 {
      flex: 1 1 auto;

      margin-right: 24px;

      font-size: 14px;
      font-weight: 700;

      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
    }
  }

  @keyframes menu-edit-in {
    0% {
      opacity: 0;
      transform: translateY(10%);
    }

    100% {
      opacity: 1;
      transform: translateY(0%);
    }
  }

  .scene-item-edit-container {
    display: none;
    justify-content: left;

    opacity: 0;

    width: 100%;
    position: absolute;
    top: -32px;
    left: 6px;
    padding-bottom: 16px;

    animation: menu-edit-in 0.3s ease-out 0.2s forwards;

    .scene-item-edit-icon {
      display: flex;
      justify-content: center;

      padding: 4px 8px;

      background-color: #eee;
      border-radius: 4px;

      box-shadow: 1px 1px 2px 0px #ddd;

      font-size: 20px;
      color: #337ab7;

      & > span:hover {
        cursor: pointer;
        color: #337ab7cc;
      }
    }
  }

  .scene-item-selected {
    /* background-color: #337ab788; */
    color: #337ab7;
    font-weight: 900;
  }

  .scene-item-selected:hover .scene-item-edit-container {
    display: flex;
  }

  .scene-item-handler-container {
    display: flex;
  }

  .scene-item-new {
    width: 180px;
    padding: 14px 16px;

    border-radius: calc(4px / var(--scale-x, 1));
    box-shadow: 0 0 0 calc(1px / var(--scale-x, 1)) rgba(63, 63, 68, 0.05),
      0 1px calc(3px / var(--scale-x, 1)) 0 rgba(34, 33, 81, 0.15);

    .scene-item-add-icon {
      font-size: 16px;
      margin-right: 6px;
      color: #337ab7;
    }
  }

  .scene-selected-detail {
    display: flex;
    flex-direction: column;
    align-content: center;
    justify-content: center;

    max-width: 800px;

    margin: 20px 10px 0px 0px;
    padding: 8px;

    border: 1px solid #ccca;
    border-radius: 4px;

    h3 {
      display: inline-block;
      font-size: 14px;
      font-weight: 700;
    }

    p {
      padding: 0;
      margin: 4px 0 0 0;

      font-size: 12px;
      line-height: 18px;
    }
  }

  .scene-edit-panel {
    position: absolute;
    margin-top: 60px;
    top: 0px;
    left: 0px;
    right: 0px;
    height: calc(100% - 60px);
  }
`
