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

test("only multiple pages receive enough trailing space to align the last page", () => {
  for (const [count, padding] of [
    [0, 0],
    [1, 0],
    [10, 0],
    [11, 432],
    [20, 0],
    [23, 336]
  ]) {
    const tops = Array.from({ length: count }, (_, i) => i * 48)
    assert.equal(scroll.getRuleBottomPadding(tops, count * 48, 480), padding)
  }
  const tops = Array.from({ length: 11 }, (_, i) => i * 48)
  assert.equal(scroll.getRuleBottomPadding(tops, 680, 480), 280)
  assert.equal(scroll.getRuleBottomPadding(tops, 1080, 480), 0)
  assert.equal(scroll.getRuleBottomPadding(tops, 680, 320), 120)
})
