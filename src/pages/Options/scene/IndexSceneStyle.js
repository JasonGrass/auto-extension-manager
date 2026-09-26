import styled from "styled-components"

export const SceneStyle = styled.div`
  padding-bottom: 24px;

  .scene-toolbar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    max-width: 540px;
    margin-bottom: 20px;
  }

  .current-active-scene-title {
    flex: 1 1 240px;
    margin: 0;
    font-size: 14px;
    color: ${(props) => props.theme.fg3};
    overflow-wrap: anywhere;
  }

  .scene-item-container {
    max-width: 540px;
  }

  .SortableList {
    flex-direction: column;
    flex-wrap: nowrap;
    gap: 12px;
    margin: 0;
  }

  .SortableItem {
    width: 100%;
    gap: 8px;
    padding: 16px 16px 16px 8px;
    border: 1px solid ${(props) => props.theme.border};
    border-radius: 8px;
    background: ${(props) => props.theme.surface};
    box-shadow: none;

    &:hover,
    &:focus-within {
      border-color: ${(props) => props.theme.input_border};
    }

    &:hover .scene-item-actions,
    &:focus-within .scene-item-actions {
      opacity: 1;
      pointer-events: auto;
    }
  }

  .DragHandle {
    align-self: flex-start;
    box-sizing: border-box;
    width: 28px;
    height: 28px;
    padding: 8px;

    svg {
      height: 12px;
    }
  }

  .scene-item {
    flex: 1;
    min-width: 0;
    align-self: stretch;
  }

  .scene-item-heading {
    display: flex;
    align-items: center;
    gap: 12px;
    height: 28px;

    .ant-switch {
      flex-shrink: 0;
    }
  }

  .scene-item-name {
    flex: 1;
    min-width: 0;
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 15px;
    font-weight: 600;
  }

  .scene-item-active .scene-item-name {
    color: ${(props) => props.theme.nav_link};
  }

  .scene-item-actions {
    display: flex;
    flex-shrink: 0;
    gap: 4px;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.15s;
  }

  .scene-item-desc {
    margin: 10px 0 0;
    overflow-wrap: anywhere;
    white-space: pre-wrap;
    color: ${(props) => props.theme.fg3};
    font-size: 13px;
    line-height: 22px;
  }

  @media (hover: none) {
    .scene-item-actions {
      opacity: 1;
      pointer-events: auto;
    }
  }

  @media (max-width: 600px) {
    .scene-item-heading {
      gap: 8px;
    }
    .action-label {
      display: none;
    }
  }
`
