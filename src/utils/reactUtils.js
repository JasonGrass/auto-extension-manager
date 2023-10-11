import React from "react"

import _ from "lodash"

// [React Hooks useEffect多个依赖批量操作 - 掘金](https://juejin.cn/post/6994085055559630879 )

export function useDebounce(fn, wait = 1000) {
  const func = React.useRef(fn)
  func.current = fn
  const debounceWrapper = React.useRef(_.debounce((args) => func.current?.(args), wait))
  return debounceWrapper.current
}

export function useBatchEffect(effect, deps, wait = 0) {
  const fn = useDebounce(effect, wait)
  React.useEffect(fn, deps)
}
