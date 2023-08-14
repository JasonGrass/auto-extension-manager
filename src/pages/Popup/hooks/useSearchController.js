import { useCallback, useEffect, useState } from "react"

import { filterExtensions, isAppExtension, isExtExtension } from ".../utils/extensionHelper"
import isMatch from ".../utils/searchHelper"

/**
 * 根据搜索词和当前选择的分组变化，执行搜索
 */
export const useSearchController = (extensions) => {
  // 普通扩展
  const [pluginExtensions, setPluginExtensions] = useState([])
  // APP 类型的扩展
  const [appExtensions, setAppExtensions] = useState([])

  // 当前分组（空表示显示全部）
  const [currentGroup, setCurrentGroup] = useState(null)
  // 当前的搜索词
  const [currentSearchText, setSearchText] = useState("")

  // 执行普通扩展的搜索
  const searchPlugin = useCallback(
    (group, search) => {
      let groupExtensions = []
      if (group) {
        if (!group.extensions || group.extensions.length === 0) {
          return groupExtensions
        }

        groupExtensions = extensions.filter((ext) => group.extensions.includes(ext.id))
      } else {
        groupExtensions = filterExtensions(extensions, isExtExtension)
      }

      if (!search || search.trim() === "") {
        return groupExtensions
      } else {
        const result = groupExtensions.filter((ext) => {
          return isMatch(
            [ext.name, ext.shortName, ext.__attach__?.alias, ext.__attach__?.remark],
            search
          )
        })
        return result
      }
    },
    [extensions]
  )

  // 执行 APP 类型扩展的搜索
  const searchApp = useCallback(
    (text) => {
      const allApp = filterExtensions(extensions, isAppExtension)
      if (!text || text.trim() === "") {
        setAppExtensions(allApp)
        return
      }
      const searchResult = allApp.filter((ext) => {
        return isMatch([ext.name, ext.shortName], text)
      })

      return searchResult
    },
    [extensions]
  )

  // 初始化扩展列表
  useEffect(() => {
    setPluginExtensions(searchPlugin(currentGroup, currentSearchText))
    setAppExtensions(searchApp(currentSearchText))
  }, [currentGroup, currentSearchText, searchPlugin, searchApp])

  // 执行搜索，搜索词变更时调用
  const onSearchByTextChange = (text) => {
    setSearchText(text)
  }

  // 执行搜索，当前分组变更时调用
  const onSearchByGroupChange = (group) => {
    setCurrentGroup(group)
  }

  return [pluginExtensions, appExtensions, onSearchByTextChange, onSearchByGroupChange]
}
