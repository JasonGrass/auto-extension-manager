import { MAX_COLUMN_COUNT, MIN_COLUMN_COUNT } from ".../pages/Options/settings/SettingConst"

export function getPopupWidth(layout, totalCount, columnCount) {
  if (layout === "grid") {
    let count = Number(columnCount)
    if (Number.isNaN(count) || count < MIN_COLUMN_COUNT || count > MAX_COLUMN_COUNT) {
      count = MIN_COLUMN_COUNT
    }

    return `${count * 80}px`
  } else {
    return "420px"
  }
}

export function getPopupHeight(layout, totalCount, columnCount) {
  // const minHeight = Math.min(600, Math.max(200, totalCount * 40))
}
