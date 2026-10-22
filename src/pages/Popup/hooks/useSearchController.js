import { useCallback, useMemo, useState } from "react"

import { filterExtensions, isAppExtension, isExtExtension } from ".../utils/extensionHelper"
import isMatch from ".../utils/searchHelper"
import { buildNoGroup, NO_GROUP_ID } from "../utils/popupGroupHelper"

/**
 * 根据搜索词和当前选择的分组变化，执行搜索
 */
export const useSearchController = (extensions, options, initialGroup = null) => {
  // 当前分组（空表示显示全部）
  const [currentGroup, setCurrentGroup] = useState(initialGroup)
  // 当前的搜索词
  const [currentSearchText, setSearchText] = useState("")

  // 执行普通扩展的搜索
  const searchPlugin = useCallback(
    (group, search) => {
      let groupExtensions = filterExtensions(extensions, isExtExtension)
      if (group?.id === NO_GROUP_ID) {
        group = buildNoGroup(groupExtensions, options.groups, group.name)
      }
      if (group) {
        if (!group.extensions || group.extensions.length === 0) {
          return []
        }

        groupExtensions = groupExtensions.filter((ext) => group.extensions.includes(ext.id))
      } else {
        // “显示固定分组扩展”只影响全部等综合视图；直接选择固定分组时仍显示组内内容。
        if (!(options.setting.isShowFixedExtension ?? true)) {
          const fixedExtensionIds =
            options.groups?.find((item) => item.id === "fixed")?.extensions ?? []
          groupExtensions = groupExtensions.filter((ext) => !fixedExtensionIds.includes(ext.id))
        }
      }

      if (!search || search.trim() === "") {
        return groupExtensions
      } else {
        const result = groupExtensions.filter((ext) => {
          return isMatch(
            [
              ext.name,
              ext.shortName,
              ext.description,
              ext.__attach__?.alias,
              ext.__attach__?.remark,
              ext.__attach__?.groupName
            ],
            search
          )
        })
        return result
      }
    },
    [extensions, options.groups, options.setting.isShowFixedExtension]
  )

  // 执行 APP 类型扩展的搜索
  const searchApp = useCallback(
    (text) => {
      const allApp = filterExtensions(extensions, isAppExtension)

      if (!text || text.trim() === "") {
        return allApp
      }
      const searchResult = allApp.filter((ext) => {
        return isMatch([ext.name, ext.shortName, ext.description], text)
      })
      return searchResult
    },
    [extensions]
  )

  const pluginExtensions = useMemo(
    () => searchPlugin(currentGroup, currentSearchText),
    [currentGroup, currentSearchText, searchPlugin]
  )
  const appExtensions = useMemo(() => searchApp(currentSearchText), [currentSearchText, searchApp])

  // 执行搜索，搜索词变更时调用
  const onSearchByTextChange = useCallback((text) => {
    setSearchText(text)
  }, [])

  // 执行搜索，当前分组变更时调用
  const onSearchByGroupChange = useCallback((group) => {
    setCurrentGroup(group)
  }, [])

  return [
    pluginExtensions,
    appExtensions,
    onSearchByTextChange,
    onSearchByGroupChange,
    currentGroup
  ]
}
