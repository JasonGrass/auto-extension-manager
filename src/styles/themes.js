const sharedTheme = {
  primary: "#4f6bed",
  primary_hover: "#3f5bd9",
  primary_active: "#3349b8",
  success: "#22a06b",
  warning: "#d97706",
  danger: "#dc4c64",
  on_accent: "#fff"
}

export const lightTheme = {
  ...sharedTheme,
  isDark: false,
  bg: "#ffffff",
  surface: "#ffffff",
  surface_elevated: "#ffffff",
  fg: "#202938",
  fg2: "#2b3545",
  fg3: "#465368",
  fg4: "#59677d",
  fg5: "#6d7a8f",
  fg6: "#8792a5",
  border: "#e9edf3",
  border2: "#dfe4ec",
  border3: "#cfd6e1",
  nav_hover_bg: "#eef2ff",
  nav_link: "#4057c7",
  nav_link_hover: "#3047b5",
  primary_soft: "#eef2ff",
  primary_soft_strong: "#dfe6ff",
  success_soft: "#e9f7f0",
  warning_soft: "#fff5e5",
  danger_soft: "#ffedf1",
  setting_gradient: "linear-gradient(135deg, #f8faff 0%, #eef2ff 100%)",
  setting_border_bottom: "#dfe5f0",
  scene_edit_bg: "#ffffff",
  scene_edit_shadow: "rgba(35, 48, 75, 0.14)",
  scene_new_hover_bg: "#f1f4fa",
  group_other_bg: "#edf1f6",
  group_other_color: "#59677d",
  sortable_item_bg: "#ffffff",
  sortable_item_color: "#2b3545",
  sortable_shadow:
    "0 0 0 calc(1px / var(--scale-x, 1)) rgba(50, 65, 90, 0.08), 0 4px calc(12px / var(--scale-x, 1)) rgba(35, 48, 75, 0.1)",
  card_shadow: "0 3px 12px rgba(35, 48, 75, 0.1)",
  drag_handle_hover_bg: "rgba(79, 107, 237, 0.09)",
  drag_handle_fill: "#8792a5",
  input_border: "#d5dbe5",
  enable_text: "#2b3545",
  disable_text: "#98a2b3",
  btn_bg: "#f1f4f8",
  btn_hover_bg: "#e5eaf1",
  header_shadow: "0 1px 0 #e5e9f0, 0 4px 14px rgba(35, 48, 75, 0.07)",
  focus_ring: "rgba(79, 107, 237, 0.2)",
  scrollbar_thumb: "#c4ccd8",
  scrollbar_track: "#edf0f5",
  disabled_bg: "#f3f5f8",
  pin_dot: "#22a06b",
  pin_ring: "#ffffff",
  operation_bg: "#4057c7",
  operation_title_bg: "#354bb5",
  operation_shadow: "rgba(48, 71, 181, 0.28)",
  tooltip_bg: "rgba(24, 31, 43, 0.94)",
  modal_overlay: "rgba(30, 42, 62, 0.38)"
}

export const darkTheme = {
  ...sharedTheme,
  isDark: true,
  primary: "#7c96ff",
  primary_hover: "#93a9ff",
  primary_active: "#647fe8",
  success: "#45c98d",
  warning: "#f0ad4e",
  danger: "#ff7088",
  bg: "#11151d",
  surface: "#171c26",
  surface_elevated: "#1e2531",
  fg: "#edf1f7",
  fg2: "#dce3ed",
  fg3: "#c3ccd9",
  fg4: "#aeb9c8",
  fg5: "#98a5b7",
  fg6: "#7f8b9d",
  border: "#222a36",
  border2: "#2a3442",
  border3: "#384455",
  nav_hover_bg: "#20283a",
  nav_link: "#9aafff",
  nav_link_hover: "#becaff",
  primary_soft: "#202942",
  primary_soft_strong: "#29365c",
  success_soft: "#17352b",
  warning_soft: "#392b19",
  danger_soft: "#3b2029",
  setting_gradient: "linear-gradient(135deg, #1b2230 0%, #202942 100%)",
  setting_border_bottom: "#303a4a",
  scene_edit_bg: "#202733",
  scene_edit_shadow: "rgba(0, 0, 0, 0.36)",
  scene_new_hover_bg: "#202733",
  group_other_bg: "#252e3c",
  group_other_color: "#b6c0cf",
  sortable_item_bg: "#1b212c",
  sortable_item_color: "#dce3ed",
  sortable_shadow:
    "0 0 0 calc(1px / var(--scale-x, 1)) rgba(148, 163, 184, 0.12), 0 5px calc(16px / var(--scale-x, 1)) rgba(0, 0, 0, 0.3)",
  card_shadow: "0 4px 16px rgba(0, 0, 0, 0.28)",
  drag_handle_hover_bg: "rgba(124, 150, 255, 0.13)",
  drag_handle_fill: "#7f8b9d",
  input_border: "#354154",
  enable_text: "#e3e8ef",
  disable_text: "#707d90",
  btn_bg: "#222a36",
  btn_hover_bg: "#2d3746",
  header_shadow: "0 1px 0 #252e3b, 0 5px 16px rgba(0, 0, 0, 0.3)",
  focus_ring: "rgba(124, 150, 255, 0.25)",
  scrollbar_thumb: "#465267",
  scrollbar_track: "#1a202b",
  disabled_bg: "#171c25",
  pin_dot: "#45c98d",
  pin_ring: "#171c26",
  operation_bg: "#2a3659",
  operation_title_bg: "#354674",
  operation_shadow: "rgba(0, 0, 0, 0.4)",
  tooltip_bg: "rgba(8, 11, 16, 0.96)",
  modal_overlay: "rgba(4, 7, 12, 0.68)"
}

export function getAntThemeTokens(currentTheme) {
  return {
    colorPrimary: currentTheme.primary,
    colorInfo: currentTheme.primary,
    colorSuccess: currentTheme.success,
    colorWarning: currentTheme.warning,
    colorError: currentTheme.danger,
    colorBgBase: currentTheme.bg,
    colorBgContainer: currentTheme.surface,
    colorBgElevated: currentTheme.surface_elevated,
    colorText: currentTheme.fg,
    colorTextSecondary: currentTheme.fg4,
    colorBorder: currentTheme.border3,
    colorBorderSecondary: currentTheme.border2,
    borderRadius: 6,
    borderRadiusLG: 8,
    controlOutline: currentTheme.focus_ring,
    boxShadowSecondary: currentTheme.card_shadow
  }
}

export function applyThemeToDocument(currentTheme, isDarkMode) {
  document.documentElement.style.colorScheme = isDarkMode ? "dark" : "light"
  document.body.style.backgroundColor = currentTheme.bg
  document.body.style.color = currentTheme.fg

  const root = document.documentElement
  root.style.setProperty("--app-bg", currentTheme.bg)
  root.style.setProperty("--app-surface", currentTheme.surface)
  root.style.setProperty("--app-fg", currentTheme.fg)
  root.style.setProperty("--app-fg-muted", currentTheme.fg5)
  root.style.setProperty("--app-border", currentTheme.border)
  root.style.setProperty("--app-border-strong", currentTheme.border3)
  root.style.setProperty("--app-primary", currentTheme.primary)
  root.style.setProperty("--app-primary-soft", currentTheme.primary_soft)
  root.style.setProperty("--app-disabled-bg", currentTheme.disabled_bg)
  root.style.setProperty("--app-pin-dot", currentTheme.pin_dot)
  root.style.setProperty("--app-pin-ring", currentTheme.pin_ring)
  root.style.setProperty("--sortable-item-bg", currentTheme.sortable_item_bg)
  root.style.setProperty("--sortable-item-color", currentTheme.sortable_item_color)
  root.style.setProperty("--sortable-shadow", currentTheme.sortable_shadow)
  root.style.setProperty("--drag-handle-hover-bg", currentTheme.drag_handle_hover_bg)
  root.style.setProperty("--drag-handle-fill", currentTheme.drag_handle_fill)
}
