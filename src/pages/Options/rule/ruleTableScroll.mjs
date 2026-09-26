export const RULE_PAGE_SIZE = 10
export const RULE_SCROLL_HEIGHT = 480

export function getRulePage(rowTops, scrollTop) {
  // Half a pixel tolerates the browser rounding a programmatic scroll position.
  const nextRow = rowTops.findIndex((top) => top > scrollTop + 0.5)
  const index = nextRow === -1 ? rowTops.length - 1 : nextRow - 1
  return Math.floor(Math.max(0, index) / RULE_PAGE_SIZE) + 1
}

export function getRuleBottomPadding(rowTops, contentBottom, viewportHeight) {
  if (rowTops.length <= RULE_PAGE_SIZE) return 0
  const lastPageStart = Math.floor((rowTops.length - 1) / RULE_PAGE_SIZE) * RULE_PAGE_SIZE
  return Math.max(0, viewportHeight - (contentBottom - rowTops[lastPageStart]))
}
