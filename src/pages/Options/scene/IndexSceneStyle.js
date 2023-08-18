import styled from "styled-components"

export const SceneStyle = styled.div`
  position: relative;
  height: 100%;

  .current-active-scene-title {
    font-size: 16px;
    color: #555;
  }

  .scene-item-container {
    display: flex;
    margin-top: 30px;
  }

  .scene-item {
    position: relative;

    width: 300px;
    height: 70px;

    padding: 5px;
    margin: 5px 10px 10px 2px;

    border: 1px solid #ccca;
    border-radius: 5px;
    // box-shadow: 1px 1px 4px 0px #337ab788;
  }

  .scene-item-header {
    display: flex;
    align-items: center;
  }

  .scene-item-header h3 {
    flex: 1 1 auto;

    font-size: 14px;
    font-weight: 700;

    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }

  .scene-item p {
    padding: 0;
    margin: 4px 0 0 0;

    font-size: 12px;
    line-height: 18px;

    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    /*! autoprefixer: off */
    -webkit-box-orient: vertical;
  }

  .scene-item:hover .scene-item-edit-icon {
    display: block;
  }

  .scene-item-edit-icon {
    display: none;

    position: absolute;
    bottom: 5px;
    right: 5px;

    font-size: 20px;
    color: #337ab7;
  }

  .scene-item-add-icon {
    font-size: 30px;
    margin-right: 6px;
    color: #337ab7;
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
