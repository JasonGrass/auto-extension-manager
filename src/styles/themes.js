const sharedTheme = {
  primary: "#4668d8",
  primary_hover: "#3d5dc4",
  primary_active: "#3451af",
  success: "#168258",
  warning: "#9a5a00",
  danger: "#bb3450",
  on_accent: "#fff"
}

export const lightTheme = {
  ...sharedTheme,
  isDark: false,
  bg: "#f5f7fb",
  surface: "#ffffff",
  surface_elevated: "#ffffff",
  fg: "#202938",
  fg2: "#2b3545",
  fg3: "#465368",
  fg4: "#667085",
  fg5: "#667085",
  fg6: "#667085",
  border: "#e2e7f0",
  border2: "#e2e7f0",
  border3: "#cbd3e1",
  nav_hover_bg: "#f0f3fa",
  nav_link: "#3658be",
  nav_link_hover: "#29499f",
  nav_link_active: "#243e86",
  primary_soft: "#edf2ff",
  primary_soft_strong: "#e4ecff",
  success_soft: "#e9f7f0",
  warning_soft: "#fff5e5",
  danger_soft: "#ffedf1",
  scene_edit_bg: "#ffffff",
  scene_edit_shadow: "rgba(35, 48, 75, 0.14)",
  scene_new_hover_bg: "#f1f4fa",
  group_other_bg: "#edf1f6",
  group_other_color: "#59677d",
  sortable_item_bg: "#ffffff",
  sortable_item_color: "#2b3545",
  sortable_shadow: "0 0 0 calc(1px / var(--scale-x, 1)) #e2e7f0",
  card_shadow: "0 6px 20px rgba(35, 48, 75, 0.12)",
  drag_handle_hover_bg: "#edf2ff",
  drag_handle_fill: "#667085",
  input_border: "#8591a6",
  enable_text: "#2b3545",
  disable_text: "#667085",
  btn_bg: "#f1f4f8",
  btn_hover_bg: "#e5eaf1",
  header_shadow: "0 1px 0 #e2e7f0",
  focus_ring: "rgba(70, 104, 216, 0.2)",
  scrollbar_thumb: "#c4ccd8",
  scrollbar_track: "#edf0f5",
  disabled_bg: "#f3f5f8",
  pin_dot: "#168258",
  pin_ring: "#ffffff",
  operation_bg: "#ffffff",
  operation_title_bg: "#f5f7fb",
  operation_shadow: "rgba(35, 48, 75, 0.14)",
  tooltip_bg: "rgba(24, 31, 43, 0.94)",
  modal_overlay: "rgba(30, 42, 62, 0.38)"
}

export const darkTheme = {
  ...sharedTheme,
  isDark: true,
  success: "#45c98d",
  warning: "#f0ad4e",
  danger: "#ff7088",
  bg: "#141922",
  surface: "#1c2330",
  surface_elevated: "#252e3d",
  fg: "#e7ecf4",
  fg2: "#dce3ed",
  fg3: "#c3ccd9",
  fg4: "#a7b0c0",
  fg5: "#a7b0c0",
  fg6: "#a7b0c0",
  border: "#323e50",
  border2: "#323e50",
  border3: "#455369",
  nav_hover_bg: "#252e3d",
  nav_link: "#93b4ff",
  nav_link_hover: "#b6ccff",
  nav_link_active: "#d0ddff",
  primary_soft: "#253552",
  primary_soft_strong: "#2c4061",
  success_soft: "#17352b",
  warning_soft: "#392b19",
  danger_soft: "#3b2029",
  scene_edit_bg: "#252e3d",
  scene_edit_shadow: "rgba(0, 0, 0, 0.2)",
  scene_new_hover_bg: "#252e3d",
  group_other_bg: "#252e3c",
  group_other_color: "#b6c0cf",
  sortable_item_bg: "#1c2330",
  sortable_item_color: "#dce3ed",
  sortable_shadow: "0 0 0 calc(1px / var(--scale-x, 1)) #323e50",
  card_shadow: "0 6px 20px rgba(0, 0, 0, 0.2)",
  drag_handle_hover_bg: "#253552",
  drag_handle_fill: "#a7b0c0",
  input_border: "#65758e",
  enable_text: "#e3e8ef",
  disable_text: "#a7b0c0",
  btn_bg: "#252e3d",
  btn_hover_bg: "#323e50",
  header_shadow: "0 1px 0 #323e50",
  focus_ring: "rgba(147, 180, 255, 0.25)",
  scrollbar_thumb: "#465267",
  scrollbar_track: "#1a202b",
  disabled_bg: "#1c2330",
  pin_dot: "#45c98d",
  pin_ring: "#1c2330",
  operation_bg: "#252e3d",
  operation_title_bg: "#1c2330",
  operation_shadow: "rgba(0, 0, 0, 0.2)",
  tooltip_bg: "rgba(8, 11, 16, 0.96)",
  modal_overlay: "rgba(4, 7, 12, 0.68)"
}

export function getAntThemeTokens(currentTheme) {
  return {
    colorPrimary: currentTheme.primary,
    colorPrimaryHover: currentTheme.primary_hover,
    colorPrimaryActive: currentTheme.primary_active,
    colorPrimaryText: currentTheme.nav_link,
    colorPrimaryTextHover: currentTheme.nav_link_hover,
    colorPrimaryTextActive: currentTheme.nav_link_active,
    colorPrimaryBg: currentTheme.primary_soft,
    colorPrimaryBgHover: currentTheme.primary_soft_strong,
    colorPrimaryBorder: currentTheme.nav_link,
    colorPrimaryBorderHover: currentTheme.nav_link_hover,
    colorLink: currentTheme.nav_link,
    colorLinkHover: currentTheme.nav_link_hover,
    colorLinkActive: currentTheme.nav_link_active,
    colorInfo: currentTheme.primary,
    colorSuccess: currentTheme.success,
    colorWarning: currentTheme.warning,
    colorError: currentTheme.danger,
    colorBgBase: currentTheme.bg,
    colorBgLayout: currentTheme.bg,
    colorBgContainer: currentTheme.surface,
    colorBgElevated: currentTheme.surface_elevated,
    colorText: currentTheme.fg,
    colorTextSecondary: currentTheme.fg4,
    colorTextTertiary: currentTheme.fg5,
    colorTextLightSolid: currentTheme.on_accent,
    colorBorder: currentTheme.input_border,
    colorBorderSecondary: currentTheme.border2,
    controlItemBgActive: currentTheme.primary_soft,
    controlItemBgActiveHover: currentTheme.primary_soft_strong,
    controlItemBgHover: currentTheme.nav_hover_bg,
    borderRadius: 6,
    borderRadiusLG: 8,
    controlOutline: currentTheme.focus_ring,
    boxShadowSecondary: currentTheme.card_shadow
  }
}

export function getAntThemeComponents(currentTheme) {
  // Ant's outlined buttons and selected menu text otherwise reuse the filled
  // button palette, which is too dark for text on dark surfaces.
  const textAccent = {
    colorPrimary: currentTheme.nav_link,
    colorPrimaryHover: currentTheme.nav_link_hover,
    colorPrimaryActive: currentTheme.nav_link_active
  }
  return {
    Button: {
      defaultHoverColor: currentTheme.nav_link_hover,
      defaultHoverBorderColor: currentTheme.nav_link,
      defaultActiveColor: currentTheme.nav_link_active,
      defaultActiveBorderColor: currentTheme.nav_link_active,
      defaultShadow: "none",
      primaryShadow: "none"
    },
    Pagination: {
      ...textAccent,
      itemActiveColor: currentTheme.nav_link,
      itemActiveColorHover: currentTheme.nav_link_hover,
      itemActiveBg: currentTheme.primary_soft
    },
    Dropdown: textAccent,
    Table: textAccent,
    Steps: {
      ...textAccent,
      colorTextLightSolid: currentTheme.isDark ? currentTheme.bg : currentTheme.on_accent
    },
    Segmented: {
      itemSelectedBg: currentTheme.primary_soft,
      itemSelectedColor: currentTheme.nav_link
    },
    Slider: {
      handleActiveColor: currentTheme.nav_link_hover
    },
    Switch: {
      colorTextQuaternary: currentTheme.input_border,
      colorTextTertiary: currentTheme.fg4
    }
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
  root.style.setProperty("--app-primary", currentTheme.nav_link)
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

// Keep asynchronous storage reads from replacing a newer preference or updating
// a page that has unmounted. Storage uses LargeSync's chunked setting keys.
export function observeThemePreference({ readMode, mediaQuery, storageChanges, onChange }) {
  let mode
  let revision = 0
  let disposed = false

  const publish = (value) => {
    mode = value === "light" || value === "dark" ? value : "system"
    onChange({ mode, isDarkMode: mode === "dark" || (mode === "system" && mediaQuery.matches) })
  }

  const refresh = async () => {
    const request = ++revision
    try {
      const value = await readMode()
      if (!disposed && request === revision) publish(value)
    } catch (error) {
      console.error("Unable to read theme preference", error)
      if (!disposed && request === revision && mode === undefined) publish("system")
    }
  }

  const onSystemChange = () => {
    if (mode === "system") publish(mode)
  }
  const onStorageChange = (changes, area) => {
    if (
      area === "sync" &&
      Object.keys(changes).some((key) => key.startsWith("LS__setting.") || key === "options")
    ) {
      void refresh()
    }
  }

  mediaQuery.addEventListener("change", onSystemChange)
  storageChanges.addListener(onStorageChange)
  void refresh()

  return {
    setMode(value) {
      if (disposed) return
      revision++
      publish(value)
    },
    dispose() {
      disposed = true
      mediaQuery.removeEventListener("change", onSystemChange)
      storageChanges.removeListener(onStorageChange)
    }
  }
}
