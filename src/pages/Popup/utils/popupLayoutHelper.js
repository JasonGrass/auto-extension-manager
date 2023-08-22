export function getPopupWidth(layout, totalCount, columnCount) {
  if (layout === "grid") {
    let count = Number(columnCount)
    if (Number.isNaN(count) || count < 6 || count > 10) {
      count = 6
    }

    return `${count * 80}px`
  } else {
    return "420px"
  }
}

export function getPopupHeight(layout, totalCount, columnCount) {
  // const minHeight = Math.min(600, Math.max(200, totalCount * 40))
}
