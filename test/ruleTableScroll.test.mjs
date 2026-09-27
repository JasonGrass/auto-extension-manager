import assert from "node:assert/strict"
import { test } from "node:test"

import * as scroll from "../src/pages/Options/rule/ruleTableScroll.mjs"

// A fixed-height calculation would fail these variable-height and page-boundary cases.

test("scrolling uses actual row offsets and crosses pages in both directions", () => {
  const tops = [0, 48, 96, 180, 228, 276, 324, 372, 420, 468, 540, 588]
  for (const [position, page] of [
    [0, 1],
    [539, 1],
    [540, 2],
    [600, 2],
    [48, 1]
  ]) {
    assert.equal(scroll.getRulePage(tops, position), page)
  }
  assert.equal(scroll.getRulePage([], 0), 1)
  assert.equal(scroll.getRulePage([0], 100), 1)
  // Browsers round scroll positions; a subpixel row boundary still belongs to its page.
  assert.equal(scroll.getRulePage([...tops.slice(0, 10), 540.25], 540), 2)
})

test("the natural scroll bottom selects the last page without trailing space", () => {
  for (const count of [0, 1, 10, 11, 20, 21, 23]) {
    const tops = Array.from({ length: count }, (_, i) => i * 48)
    const maxScrollTop = Math.max(0, count * 48 - 480)
    assert.equal(scroll.getRulePage(tops, 0, maxScrollTop), 1)
    assert.equal(
      scroll.getRulePage(tops, maxScrollTop, maxScrollTop),
      Math.max(1, Math.ceil(count / 10))
    )
  }

  const tops = Array.from({ length: 21 }, (_, i) => i * 48)
  assert.equal(scroll.getRulePage(tops, 526, 528), 2)
  assert.equal(scroll.getRulePage(tops, 527.5, 528), 3)
  assert.equal(scroll.getRulePage(tops, 48, 528), 1)
})

test("bottom detection follows variable row heights, resizing and deleting the last row", () => {
  const tops = Array.from({ length: 21 }, (_, i) => i * 72.5)
  for (const viewport of [320, 480, 600]) {
    const maxScrollTop = 21 * 72.5 - viewport
    assert.equal(scroll.getRulePage(tops, maxScrollTop, maxScrollTop), 3)
    const afterDelete = tops.slice(0, -1)
    const nextMaxScrollTop = 20 * 72.5 - viewport
    assert.equal(scroll.getRulePage(afterDelete, nextMaxScrollTop, nextMaxScrollTop), 2)
  }
  // When all rows fit, the table stays at the first page.
  assert.equal(scroll.getRulePage(tops, 0, 0), 1)
})
