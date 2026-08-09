import { MAX_COLUMN_COUNT, MIN_COLUMN_COUNT } from ".../pages/Options/settings/SettingConst"

export const LIST_POPUP_WIDTH = 480

export function getPopupWidth(layout, totalCount, columnCount) {
  if (layout === "grid") {
    let count = Number(columnCount)
    if (Number.isNaN(count) || count < MIN_COLUMN_COUNT || count > MAX_COLUMN_COUNT) {
      count = MIN_COLUMN_COUNT
    }

    return `${count * 80}px`
  } else {
    return `${LIST_POPUP_WIDTH}px`
  }
}

export function applyPopupWidth(layout, totalCount, columnCount, zoomRatio = 100) {
  const width = getPopupWidth(layout, totalCount, columnCount)
  const ratio = Number(zoomRatio)
  const zoom = Number.isFinite(ratio) && ratio > 0 ? ratio / 100 : 1

  // Keep body's logical width for layout, while sizing Chrome's popup viewport
  // from the zoomed visual width of the root document.
  document.documentElement.style.width = `${parseFloat(width) * zoom}px`
  document.body.style.width = width
}

export function getPopupHeight(layout, totalCount, columnCount, groupCount) {
  if (layout === "grid") {
    const estimation = Math.max(Math.ceil(totalCount / columnCount), groupCount) * 100 + 100 // 往大了估算所需的高度
    const h = Math.min(600, Math.max(200, estimation))
    return `${h}px`
  } else {
    const h = Math.min(600, Math.max(200, totalCount * 40))
    return `${h}px`
  }
}
