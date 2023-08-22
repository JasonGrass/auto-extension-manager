import React, { memo, useEffect, useState } from "react"

import { Input } from "antd"

import { GroupOptions } from ".../storage/GroupOptions"
import { ManageOptions } from ".../storage/index"
import { isAppExtension } from ".../utils/extensionHelper"
import { appendAdditionInfo } from ".../utils/extensionHelper"
import { isExtensionMatch } from ".../utils/searchHelper"
import ExtensionItems from "../components/ExtensionItems"
import { GroupContentStyle } from "./GroupContentStyle"

const { Search } = Input

const GroupContent = memo(({ group, groupList, extensions, options }) => {
  // 在分组中的扩展
  const [containExts, setContains] = useState([])
  // 没有在分组中的扩展
  const [noneGroupExts, setNoneGroupExts] = useState([])

  // 显示到界面的，在分组中的扩展（配合搜索功能）
  const [shownContainExts, setShownContainExts] = useState([])
  // 显示到界面的，没有在分组中的扩展（配合搜索功能）
  const [shownNoneGroupExts, setShownNoneGroupExts] = useState([])
  // 搜索词
  const [searchWord, setSearchWord] = useState("")

  // 初始化
  useEffect(() => {
    // 包含在当前分组中的扩展
    const containsExts =
      group?.extensions?.map((id) => extensions.find((e) => e.id === id)).filter((ext) => ext) ?? []
    const containsExtIds = containsExts.map((ext) => ext.id)

    // 剩余未分组：展示不在当前分组中的扩展（至于这些分组是不是在其他分组中，不考虑。一个扩展可以放在多个分组中）
    const noneGroupedExtensions = extensions
      .filter((ext) => !containsExtIds.includes(ext.id))
      .filter((ext) => !isAppExtension(ext))

    ManageOptions.get().then((managementOptions) => {
      setContains(appendAdditionInfo(containsExts, managementOptions))
      setNoneGroupExts(appendAdditionInfo(noneGroupedExtensions, managementOptions))
      setShownContainExts(containsExts)
      setShownNoneGroupExts(noneGroupedExtensions)
    })
  }, [group, groupList, extensions])

  // 搜索
  useEffect(() => {
    if (!searchWord || searchWord.trim() === "") {
      setShownContainExts(containExts)
      setShownNoneGroupExts(noneGroupExts)
      return
    }

    setShownContainExts(containExts.filter((ext) => isExtensionMatch(ext, searchWord)))
    setShownNoneGroupExts(noneGroupExts.filter((ext) => isExtensionMatch(ext, searchWord)))
  }, [searchWord, containExts, noneGroupExts])

  // 保存分组中的扩展记录
  const save = async (contains) => {
    const duplicateGroup = { ...group }
    duplicateGroup.extensions = contains.map((ext) => ext.id)
    GroupOptions.update(duplicateGroup)
  }

  // 搜索
  const onSearch = (value) => {
    setSearchWord(value)
  }

  if (!group) {
    return null
  }

  return (
    <GroupContentStyle>
      <Search
        className="search"
        placeholder="search"
        onSearch={onSearch}
        onChange={(e) => onSearch(e.target.value)}
      />
      <h3>「{group.name}」中的插件</h3>
      {buildExtContainer(shownContainExts, true)}
      <h3>不在此分组</h3>
      {buildExtContainer(shownNoneGroupExts, false)}
      <p className="desc">{group.desc}</p>
    </GroupContentStyle>
  )

  function buildExtContainer(shownItems, isGrouped) {
    const onIconClick = (e, item) => {
      if (isGrouped) {
        const contain = containExts.filter((ext) => ext.id !== item.id)
        const none = [...noneGroupExts, item]
        setContains(contain)
        setNoneGroupExts(none)
        save(contain)
      } else {
        const none = noneGroupExts.filter((ext) => ext.id !== item.id)
        const contain = [...containExts, item]
        setContains(contain)
        setNoneGroupExts(none)
        save(contain)
      }
    }

    return (
      <ExtensionItems
        items={shownItems}
        onClick={onIconClick}
        placeholder="none"
        options={options}
        showFixedPin={
          isGrouped && group.id === "fixed" && options.setting.isShowDotOfFixedExtension
        }
      />
    )
  }
})

export default GroupContent
