import { styled } from "styled-components"

/** Shared switch geometry keeps group and scene rows visually aligned. */
export const StateToggleTarget = styled.span`
  display: inline-flex;
  flex: none;
  padding: 2px 0;
`

/**
 * Base two-position switch. GroupStateToggle additionally uses the middle and
 * empty classes, while SceneStateToggle deliberately exposes only off/on.
 */
export const StateToggleButton = styled.button`
  position: relative;
  width: 42px;
  height: 20px;
  padding: 0;
  border: 0;
  border-radius: 10px;
  background: ${(props) => props.theme.fg6};
  cursor: pointer;
  transition: background 0.2s ease;

  .thumb {
    position: absolute;
    top: 2px;
    left: 2px;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: ${(props) => props.theme.surface};
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
    transition: left 0.2s ease;
  }

  &.state-on {
    background: ${(props) => props.theme.primary};

    .thumb {
      left: 24px;
    }
  }

  &.state-mixed {
    background: ${(props) => props.theme.warning};

    .thumb {
      left: 13px;
    }
  }

  &.state-empty {
    background: ${(props) => props.theme.border3};
  }

  &.loading {
    opacity: 0.55;
    cursor: wait;
  }

  &:disabled {
    cursor: not-allowed;
  }

  &:focus-visible {
    outline: 2px solid ${(props) => props.theme.primary};
    outline-offset: 2px;
  }
`
