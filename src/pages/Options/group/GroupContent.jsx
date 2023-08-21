import React, { memo, useEffect, useState } from "react"

import { GroupOptions } from ".../storage/GroupOptions"
import { isAppExtension } from ".../utils/extensionHelper"
import { isStringEmpty } from ".../utils/utils.js"
import ExtensionItems from "../components/ExtensionItems"
import { GroupContentStyle } from "./GroupContentStyle"

const GroupContent = memo(({ group, groupList, extensions, managementOptions }) => {
  const [containExts, setContains] = useState([])
  const [noneGroupExts, setNoneGroupExts] = useState([])

  useEffect(() => {
    // 包含在当前分组中的扩展
    const containsExts =
      group?.extensions?.map((id) => extensions.find((e) => e.id === id)).filter((ext) => ext) ?? []
    const containsExtIds = containsExts.map((ext) => ext.id)

    // 剩余未分组：展示不在当前分组中的扩展（至于这些分组是不是在其他分组中，不考虑。一个扩展可以放在多个分组中）
    const noneGroupedExtensions = extensions
      .filter((ext) => !containsExtIds.includes(ext.id))
      .filter((ext) => !isAppExtension(ext))

    setContains(containsExts)
    setNoneGroupExts(noneGroupedExtensions)
  }, [group, groupList, extensions])

  const save = async (contains) => {
    const item = { ...group }
    item.extensions = contains.map((ext) => ext.id)
    console.log("update", item)
    GroupOptions.update(item)
  }

  if (!group) {
    return null
  }

  return (
    <GroupContentStyle>
      <h3>「{group.name}」中的插件</h3>
      {buildExtContainer(containExts, true)}
      <h3>不在此分组</h3>
      {buildExtContainer(noneGroupExts, false)}
      <p className="desc">{group.desc}</p>
    </GroupContentStyle>
  )

  function buildExtContainer(extItems, isGrouped) {
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
        items={extItems}
        onClick={onIconClick}
        placeholder="none"
        managementOptions={managementOptions}
      />
    )
  }
})

export default GroupContent
