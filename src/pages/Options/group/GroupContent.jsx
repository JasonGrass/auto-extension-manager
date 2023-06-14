import React, { memo, useEffect, useState } from "react"

import { DeleteFilled, EditFilled, PlusOutlined } from "@ant-design/icons"
import { Button, Form, Input, Popconfirm, message } from "antd"
import classNames from "classnames"

import { GroupOptions } from ".../storage/GroupOptions"
import { isAppExtension, sortExtension } from ".../utils/extensionHelper"
import { isStringEmpty } from ".../utils/utils.js"
import ExtensionItems from "../components/ExtensionItems"
import { GroupContentStyle } from "./GroupContentStyle"

const GroupContent = memo(({ group, groupList, extensions }) => {
  const [containExts, setContains] = useState()
  const [noneGroupExts, setNoneGroupExts] = useState()

  useEffect(() => {
    const containsExts = group?.extensions
      ?.map((id) => extensions.find((e) => e.id === id))
      .filter((ext) => ext)

    const groupedIds = groupList
      .map((g) => g.extensions)
      .flat()
      .filter((id) => !isStringEmpty(id))

    const noneGroupedExtensions = extensions
      .filter((ext) => !groupedIds.includes(ext.id))
      .filter((ext) => !isAppExtension(ext))

    setContains(sortExtension(containsExts))
    setNoneGroupExts(sortExtension(noneGroupedExtensions))
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

  const desc = isStringEmpty(group.desc) ? "(未添加描述)" : group.desc

  return (
    <GroupContentStyle>
      <p className="text desc">{desc}</p>
      <h3>「{group.name}」中的插件</h3>
      {buildExtContainer(containExts, true)}
      <h3>剩余未分组</h3>
      {buildExtContainer(noneGroupExts, false)}
    </GroupContentStyle>
  )

  function buildExtContainer(extItems, contain) {
    const onIconClick = (e, item) => {
      if (contain) {
        const contain = containExts.filter((ext) => ext.id !== item.id)
        const none = [...noneGroupExts, item]
        setContains(sortExtension(contain))
        setNoneGroupExts(sortExtension(none))
        save(contain)
      } else {
        const none = noneGroupExts.filter((ext) => ext.id !== item.id)
        const contain = [...containExts, item]
        setContains(sortExtension(contain))
        setNoneGroupExts(sortExtension(none))
        save(contain)
      }
    }

    if (!extItems || extItems.length === 0) {
      return <p className="text">该分组中没有插件</p>
    }

    return <ExtensionItems items={extItems} onClick={onIconClick} />
  }
})

export default GroupContent
