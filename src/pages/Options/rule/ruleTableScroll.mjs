export const RULE_PAGE_SIZE = 10
export const RULE_SCROLL_HEIGHT = 410

export function getRulePage(rowTops, scrollTop, maxScrollTop) {
  // A short final page cannot reach the top without artificial trailing space.
  if (maxScrollTop > 0 && scrollTop >= maxScrollTop - 0.5) {
    return Math.max(1, Math.ceil(rowTops.length / RULE_PAGE_SIZE))
  }
  // Half a pixel tolerates the browser rounding a programmatic scroll position.
  const nextRow = rowTops.findIndex((top) => top > scrollTop + 0.5)
  const index = nextRow === -1 ? rowTops.length - 1 : nextRow - 1
  return Math.floor(Math.max(0, index) / RULE_PAGE_SIZE) + 1
}
