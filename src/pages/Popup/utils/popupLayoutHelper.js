export function getPopupWidth(layout, totalCount, lineCount) {
  if (layout === "grid") {
    return "600px"
  } else {
    return "420px"
  }
}

export function getPopupHeight(layout, totalCount, lineCount) {
  // const minHeight = Math.min(600, Math.max(200, totalCount * 40))
}
