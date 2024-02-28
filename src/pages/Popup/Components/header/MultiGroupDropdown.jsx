import React, { memo, useEffect, useState } from "react"

import { CaretDownOutlined } from "@ant-design/icons"
import { Checkbox, Dropdown } from "antd"
import { styled } from "styled-components"

import { LocalOptions } from ".../storage/local/LocalOptions"
import { getLang } from ".../utils/utils"
import { MenuStyle } from "./MenuStyle"

const localOptions = new LocalOptions()

const MultiGroupDropdown = memo((props) => {
  const { options, items, onGroupChanged } = props
  const raiseEnable = options.setting.isRaiseEnableWhenSwitchGroup

  const [selectGroupIds, setSelectGroupIds] = useState([])
  const [title, setTitle] = useState("")

  // 初始化
  useEffect(() => {
    localOptions.getValue("activeGroups").then((ids) => {
      if (ids) {
        // ids 是缓存的上一次选择的分组 ID，可能有些分组已经被删除了
        const availableIds = options.groups.filter((g) => ids.includes(g.id)).map((g) => g.id)
        setSelectGroupIds(availableIds)
      }
    })
  }, [options])

  // 下拉菜单的显示标题
  useEffect(() => {
    if (selectGroupIds.length === 0) {
      setTitle(getLang("group_unselect"))
    } else if (selectGroupIds.length === 1) {
      setTitle(options.groups.find((g) => g.id === selectGroupIds[0]).name)
    } else {
      const first = options.groups.find((g) => g.id === selectGroupIds[0]).name
      setTitle(`(${selectGroupIds.length}) ${first}...`)
    }
  }, [selectGroupIds, options])

  const menuItemOnClick = (e, item) => {
    // 为了让点击 Checkbox 之后，弹窗不要立即关闭
    e.stopPropagation()
  }

  const menuCheckboxOnClick = (e, item) => {
    e.stopPropagation()

    const list = e.target.checked
      ? [...selectGroupIds, item.id]
      : selectGroupIds.filter((id) => id !== item.id)

    setSelectGroupIds(list)

    onGroupChanged({
      action: raiseEnable,
      selects: options.groups.filter((g) => list.includes(g.id)),
      current: options.groups.find((g) => g.id === item.id)
    })

    localOptions.setValue("activeGroups", list)
  }

  const multiMenu = () => {
    const buildLabel = (item) => {
      return (
        <ItemStyle onClick={(e) => menuItemOnClick(e, item)}>
          <Checkbox
            checked={selectGroupIds.includes(item.id)}
            onChange={(e) => menuCheckboxOnClick(e, item)}>
            {item.name}
          </Checkbox>
        </ItemStyle>
      )
    }

    const menuItems = items
      .filter((i) => i.id !== "hidden")
      .filter((i) => i.id !== "fixed")
      .map((item) => {
        return {
          label: buildLabel(item),
          key: item.id,
          title: item.name
        }
      })

    return {
      items: menuItems,
      multiple: true,
      selectable: true
    }
  }

  return (
    <div>
      <Dropdown menu={multiMenu()} trigger={["hover"]} placement="bottomLeft">
        <MenuStyle>
          <span className="content">
            <span className="menu-item-text">{title}</span>
            <CaretDownOutlined className="caret" />
          </span>
        </MenuStyle>
      </Dropdown>
    </div>
  )
})

export default MultiGroupDropdown

const ItemStyle = styled.div`
  .ant-checkbox-wrapper {
    display: flex;
  }

  .ant-checkbox-wrapper > span:nth-child(2) {
    flex: 1 0 auto;
  }
`
