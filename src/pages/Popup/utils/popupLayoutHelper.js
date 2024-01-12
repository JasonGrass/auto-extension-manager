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
  if (layout === "grid") {
    const estimation = Math.ceil(totalCount / columnCount) * 100 + 100 // 往大了估算所需的高度
    const h = Math.min(600, Math.max(200, estimation))
    return `${h}px`
  } else {
    const h = Math.min(600, Math.max(200, totalCount * 40))
    return `${h}px`
  }
}
