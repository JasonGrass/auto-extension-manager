import React, { forwardRef, memo, useEffect, useImperativeHandle, useState } from "react"

import { Tag } from "antd"

import { storage } from ".../storage/sync"
import isMatch from ".../utils/searchHelper"
import { getLang } from ".../utils/utils"
import ExtensionItems from "../../components/ExtensionItems"
import EditorCommonStyle from "./CommonStyle"
import Style, { SearchStyle } from "./ExtensionSelectorStyle"

const { CheckableTag } = Tag

const ExtensionSelector = ({ options, config, extensions }, ref) => {
  const groupList = storage.helper.formatGroups(options.groups)

  useImperativeHandle(ref, () => ({
    // 获取配置
    getExtensionSelectConfig: () => {
      if (selectGroupIds.length === 0 && selectedExtensions.length === 0) {
        throw Error(getLang("rule_set_target_no_any_target"))
      }

      return {
        groups: selectGroupIds.filter((id) => groupList.find((g) => g.id === id)),
        extensions: selectedExtensions.map((e) => e.id)
      }
    }
  }))

  // 目标分组ID
  const [selectGroupIds, setSelectGroupIds] = useState([])

  // 目标扩展（规则执行的目标）
  const [selectedExtensions, setSelectedExtensions] = useState([])
  // 剩余没有被选择的所有扩展
  const [unselectedExtensions, setUnselectedExtensions] = useState([])
  // 显示到界面上的剩余扩展（搜索之后的结果）
  const [displayUnselectedExtensions, setDisplayUnselectedExtensions] = useState([])

  // 搜索关键字
  const [searchText, setSearchText] = useState("")

  // 根据配置进行初始化
  useEffect(() => {
    const myConfig = config.target ?? {}
    // 初始化目标插件组
    if (myConfig.groups && myConfig.groups.length > 0) {
      setSelectGroupIds(myConfig.groups)
    } else {
      setSelectGroupIds([])
    }

    // 初始化目标插件
    if (!myConfig.extensions) {
      setSelectedExtensions([])
      setUnselectedExtensions(extensions)
      setDisplayUnselectedExtensions(extensions)
    } else {
      const inExtensions = extensions.filter((e) => myConfig.extensions?.includes(e.id))
      const outExtension = extensions.filter((e) => !myConfig.extensions?.includes(e.id))
      setSelectedExtensions(inExtensions)
      setUnselectedExtensions(outExtension)
      setDisplayUnselectedExtensions(outExtension)
    }
  }, [config, extensions])

  // 当搜索关键字变化，或者未选择列表更新时，更新界面显示
  useEffect(() => {
    const displayUnselected = unselectedExtensions.filter((ext) => {
      return isMatch(
        [ext.name, ext.shortName, ext.description, ext.__attach__?.alias, ext.__attach__?.remark],
        searchText,
        true
      )
    })
    setDisplayUnselectedExtensions(displayUnselected)
  }, [unselectedExtensions, searchText])

  /**
   * 点击已选择的扩展
   */
  const onSelectedExtensionClick = (e, item) => {
    const selected = selectedExtensions.filter((e) => e.id !== item.id)
    setSelectedExtensions(selected)

    const unselected = [...unselectedExtensions, item]
    setUnselectedExtensions(unselected)
  }

  /**
   * 点击未选择的扩展
   */
  const onUnselectedExtensionClick = (e, item) => {
    const unselected = unselectedExtensions.filter((e) => e.id !== item.id)
    setUnselectedExtensions(unselected)

    const selected = [...selectedExtensions, item]
    setSelectedExtensions(selected)
  }

  // 搜索扩展
  const onSearchTextChange = (e) => {
    const text = e.target.value
    setSearchText(text)
  }

  // 选择的扩展组方法变化
  const handleSelectGroupChange = (groupId, checked) => {
    const nextSelectedGroupIds = checked
      ? [...selectGroupIds, groupId]
      : selectGroupIds.filter((t) => t !== groupId)
    setSelectGroupIds(nextSelectedGroupIds)
  }

  return (
    <EditorCommonStyle>
      <Style>
        <div className="editor-step-header">
          <span className="title">2 {getLang("rule_set_target_title")}</span>

          <SearchStyle>
            <input
              type="text"
              placeholder="Search"
              value={searchText}
              onChange={(e) => onSearchTextChange(e)}></input>
          </SearchStyle>
        </div>

        <div className="group-match-mode-container">
          <span className="select-group-label">
            {getLang("rule_set_target_select_extension_group")}
          </span>
          {groupList.map((group) => {
            return (
              <CheckableTag
                key={group.id}
                checked={selectGroupIds.includes(group.id)}
                onChange={(checked) => handleSelectGroupChange(group.id, checked)}>
                {group.name}
              </CheckableTag>
            )
          })}
        </div>

        <div className="extension-container">
          <h3>{getLang("rule_set_target_select_extension")}</h3>
          <ExtensionItems
            items={selectedExtensions}
            placeholder={getLang("rule_set_target_no_selected_extension")}
            onClick={onSelectedExtensionClick}></ExtensionItems>

          <div className="unselected-extensions-container">
            <h3>{getLang("rule_set_target_other_extension")}</h3>
            <ExtensionItems
              items={displayUnselectedExtensions}
              placeholder={getLang("rule_set_target_no_any_extension")}
              onClick={onUnselectedExtensionClick}></ExtensionItems>
          </div>
        </div>
      </Style>
    </EditorCommonStyle>
  )
}

export default memo(forwardRef(ExtensionSelector))
