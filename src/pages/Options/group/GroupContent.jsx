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
    const containsExts =
      group?.extensions?.map((id) => extensions.find((e) => e.id === id)).filter((ext) => ext) ?? []

    const allGroupList =
      group?.id === "fixed" ? groupList : groupList.filter((g) => g.id !== "fixed")
    // 所有已经分组的的插件ID（普通分组时，不考虑固定分组存在的扩展）
    const groupedIds = allGroupList
      .map((g) => g.extensions)
      .flat()
      .filter((id) => !isStringEmpty(id))

    const noneGroupedExtensions = extensions
      .filter((ext) => !groupedIds.includes(ext.id))
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
      <h3>剩余未分组</h3>
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
