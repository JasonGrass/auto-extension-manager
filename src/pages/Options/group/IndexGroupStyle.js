import styled from "styled-components"

export const GroupStyle = styled.div`
  position: relative;
  height: 100%;

  /* 页头：左侧标题 + 右上角操作按钮（与设置/历史页视觉一致） */
  .group-header {
    display: flex;
    align-items: center;
    justify-content: space-between;

    padding-bottom: 8px;
    margin-bottom: 10px;

    border-bottom: 1px solid ${(props) => props.theme.border};

    h1 {
      margin: 0;
      font-size: 30px;
      line-height: 60px;
      font-weight: bold;
      color: ${(props) => props.theme.fg2};
    }
  }

  .group-edit-box {
    display: flex;
  }

  /* 分组页顶部的分类统计条（总插件数 / 已分类 / 未分类） */
  .group-stat-bar {
    display: flex;
    align-items: center;
    gap: 20px;

    margin: 0 0 8px 0;
    padding: 6px 12px;

    font-size: 13px;
    color: ${(props) => props.theme.fg5};

    border: 1px solid ${(props) => props.theme.border};
    border-radius: 4px;
  }

  .left-box {
    width: 200px;
    flex-shrink: 0;

    /* background: linear-gradient(to right, #fff, #337ab788); */
  }

  .right-box {
    flex-grow: 1;
    margin-left: 10px;
  }

  .view-hidden {
    display: none;
  }

  .scene-edit-panel {
    position: absolute;
    margin-top: 60px;
    top: 0px;
    left: 0px;
    right: 0px;
    height: calc(100% - 60px);
  }

  .group-not-include-filter {
    display: flex;
    align-items: center;

    margin: 0 20px 0 0;
    padding: 5px 0 5px 5px;

    border-radius: 4px;
    border: 1px solid ${(props) => props.theme.border};

    & > * {
      margin-right: 16px;
    }
  }
`
