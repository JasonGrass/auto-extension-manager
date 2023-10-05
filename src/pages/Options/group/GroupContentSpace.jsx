import React, { memo } from "react"

import { Button } from "antd"
import styled from "styled-components"

import { LocalOptions } from ".../storage/local"
import { getLang } from ".../utils/utils"
import ExtensionItems from "../components/ExtensionItems"

/**
 * 扩展组：展示在分组中的扩展，或者不在分组中的扩展
 */
const GroupContentSpace = memo((props) => {
  const { shownItems, isGrouped, group, groupList, options, onItemClick, notificationApi } = props
  const onIconClick = (e, item) => {
    onItemClick?.({
      item,
      group,
      action: isGrouped ? "remove" : "add"
    })

    if (!isGrouped) {
      showAlreadyFixedTip(item)
    }
  }

  // 是否显示固定分组的小圆点标记
  const shouldShowFixedPin = (item) => {
    if (!options.setting.isShowDotOfFixedExtension) {
      return false
    }

    if (isGrouped && group.id === "fixed") {
      return true
    }

    const fixedGroup = groupList.find((g) => g.id === "fixed")
    return fixedGroup?.extensions?.includes(item.id)
  }

  // 如果扩展已经在固定分组中，在将扩展添加到其它分组时，给个提示 issues #36
  const showAlreadyFixedTip = async (item) => {
    if (group.id === "fixed") {
      return // 固定分组中的操作不管
    }
    if (!options.setting.isRaiseEnableWhenSwitchGroup) {
      return // 切换分组时，不执行扩展的启用与禁用，则不用提示
    }

    const local = new LocalOptions()
    const isShowAlreadyFixedTip = await local.getValue("isShowAlreadyFixedTip")
    if (isShowAlreadyFixedTip === false) {
      return
    }

    const textKnow = getLang("got_it")

    const onTipClick = (e) => {
      if (e.target.innerText === textKnow) {
        notificationApi.destroy("repeat-notification")
      }
    }

    const onClosePrompt = async () => {
      await local.setValue("isShowAlreadyFixedTip", false)
      notificationApi.destroy("repeat-notification")
    }

    if (groupList.find((g) => g.id === "fixed")?.extensions?.includes(item.id)) {
      // 扩展已经在固定分组中，切换分组时扩展将始终被激活
      // The extension is already in a fixed group. When switching groups, the extension will always be activated.
      notificationApi.info({
        message: getLang("group_may_redundant"),
        key: "repeat-notification",
        duration: 6,
        onClick: onTipClick,
        description: (
          <AlreadyFixedTipStyle>
            <p>{item.name}</p>
            <p>{getLang("group_may_redundant_desc")}</p>
            <div>
              <Button className="btn-already-fixed-tip">{textKnow}</Button>
              <Button className="btn-already-fixed-tip" onClick={onClosePrompt}>
                {getLang("no_more_prompts")}
              </Button>
            </div>
          </AlreadyFixedTipStyle>
        ),
        placement: "topRight"
      })
    }
  }

  // 显示扩展所在的其它分组
  function otherGroupInfoFooter(item) {
    if (!groupList) {
      return null
    }

    const names = groupList
      .filter((g) => {
        if (!g.extensions) {
          return false
        }
        return g.extensions.includes(item.id)
      })
      .filter((g) => g.id !== "fixed")
      .filter((g) => g.id !== "hidden")
      .filter((g) => g.id !== group.id)
      .map((g) => g.name)

    return (
      <div className="other-group-info-container">
        {names.map((n) => {
          return (
            <div key={n} className="other-group-info-name">
              {n}
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <ExtensionItems
      items={shownItems}
      onClick={onIconClick}
      placeholder="none"
      options={options}
      showFixedPin={shouldShowFixedPin}
      footer={otherGroupInfoFooter}></ExtensionItems>
  )
})

export default GroupContentSpace

const AlreadyFixedTipStyle = styled.div`
  .btn-already-fixed-tip {
    margin-right: 10px;
  }
`
