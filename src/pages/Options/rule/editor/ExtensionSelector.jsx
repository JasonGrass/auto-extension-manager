import React, {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useState
} from "react"

import { DownOutlined } from "@ant-design/icons"
import { Button, Dropdown, Space } from "antd"

import isMatch from ".../utils/searchHelper"
import ExtensionItems from "../../components/ExtensionItems"
import EditorCommonStyle from "./CommonStyle"
import Style, { SearchStyle } from "./ExtensionSelectorStyle"

const matchModes = [
  {
    label: "扩展",
    key: "single"
  },
  {
    label: "扩展组",
    key: "group"
  }
]

const ExtensionSelector = ({ groupList, config, extensions, managementOptions }, ref) => {
  useImperativeHandle(ref, () => ({
    // 获取配置
    getExtensionSelectConfig: () => {
      if (matchMode.key === "group" && !selectGroup) {
        throw Error("选择选择任何扩展组")
      }

      let extensionList = []
      if (matchMode.key === "single") {
        extensionList = selectedExtensions.filter((ext) => ext).map((ext) => ext.id)
        if (extensionList.length < 1) {
          throw Error("选择选择任何扩展")
        }
      }

      return {
        targetType: matchMode.key,
        targetGroup: selectGroup?.id,
        targetExtensions: extensionList
      }
    }
  }))

  const [matchMode, setMatchMode] = useState(matchModes[0])
  const [selectGroup, setSelectGroup] = useState(null)

  // 选择的扩展（规则执行的目标）
  const [selectedExtensions, setSelectedExtensions] = useState([])
  // 剩余没有被选择的所有扩展
  const [unselectedExtensions, setUnselectedExtensions] = useState([])
  // 显示到界面上的剩余扩展（搜索之后的结果）
  const [displayUnselectedExtensions, setDisplayUnselectedExtensions] = useState([])

  // 搜索关键字
  const [searchText, setSearchText] = useState("")

  /**
   * 在 single(扩展) 模式时，根据初始配置，设置扩展的显示
   */
  const setSelectedOfSingleByConfig = useCallback(() => {
    if (!config) {
      setSelectedExtensions([])
      setUnselectedExtensions(extensions)
      setDisplayUnselectedExtensions(extensions)
    }

    const selected = extensions.filter((ext) => config.targetExtensions.includes(ext.id))
    setSelectedExtensions(selected)
    const unselected = extensions.filter((ext) => !selected.includes(ext))
    setUnselectedExtensions(unselected)
    setDisplayUnselectedExtensions(unselected)
  }, [config, extensions])

  /**
   * 在 group(扩展组) 模式时，根据 group 数据，设置扩展的显示
   */
  const setSelectedOfGroup = useCallback(
    (group) => {
      if (group) {
        if (group.extensions && group.extensions.length > 0) {
          const ext = extensions.filter((e) => group.extensions.includes(e.id))
          setSelectedExtensions(ext)
        } else {
          setSelectedExtensions([])
        }
      } else {
        setSelectedExtensions([])
      }
    },
    [extensions]
  )

  // 根据配置进行初始化
  useEffect(() => {
    if (!config) {
      setUnselectedExtensions(extensions)
      setDisplayUnselectedExtensions(extensions)
      return
    }
    const mode = matchModes.filter((m) => m.key === config.targetType)[0]
    setMatchMode(mode ?? matchModes[0])

    if (mode.key === "group") {
      const group = groupList.filter((g) => g.id === config.targetGroup)[0]
      setSelectGroup(group)
      setSelectedOfGroup(group)
    } else if (mode.key === "single") {
      setSelectedOfSingleByConfig()
    }
  }, [config, groupList, extensions, setSelectedOfGroup, setSelectedOfSingleByConfig])

  // 当搜索关键字变化，或者未选择列表更新时，界面界面显示
  useEffect(() => {
    const displayUnselected = unselectedExtensions.filter((ext) => {
      return isMatch(
        [ext.name, ext.shortName, ext.__attach__?.alias, ext.__attach__?.remark],
        searchText,
        true
      )
    })
    setDisplayUnselectedExtensions(displayUnselected)
  }, [unselectedExtensions, searchText])

  /**
   * 匹配方式变更：扩展 / 扩展组
   */
  const handleMatchModeClick = (e) => {
    const mode = matchModes.filter((m) => m.key === e.key)[0]
    if (!mode) {
      return
    }
    if (mode.key === matchMode.key) {
      return
    }

    setMatchMode(mode)
    if (mode.key === "single") {
      setSelectedOfSingleByConfig()
    } else if (mode.key === "group") {
      setSelectedOfGroup(selectGroup)
    }
  }

  const matchModeMenuProps = {
    items: matchModes,
    onClick: handleMatchModeClick
  }

  const extGroupSelectMenuProps = {
    items: groupList.map((g) => ({
      label: g.name,
      key: g.id
    })),
    onClick: (e) => {
      const selectGroup = groupList.filter((g) => g.id === e.key)[0]
      setSelectGroup(selectGroup)
      setSelectedOfGroup(selectGroup)
    }
  }

  /**
   * 点击已选择的扩展
   */
  const onSelectedExtensionClick = (e, item) => {
    if (matchMode.key === "single") {
      const selected = selectedExtensions.filter((e) => e.id !== item.id)
      setSelectedExtensions(selected)

      const unselected = [...unselectedExtensions, item]
      setUnselectedExtensions(unselected)
    }
  }

  /**
   * 点击未选择的扩展
   */
  const onUnselectedExtensionClick = (e, item) => {
    if (matchMode.key === "single") {
      const unselected = unselectedExtensions.filter((e) => e.id !== item.id)
      setUnselectedExtensions(unselected)

      const selected = [...selectedExtensions, item]
      setSelectedExtensions(selected)
    }
  }

  const onSearchTextChange = (e) => {
    const text = e.target.value
    setSearchText(text)
  }

  return (
    <EditorCommonStyle>
      <Style>
        <div className="header">
          <span className="title">扩展（组）</span>
          <div>
            <Dropdown.Button menu={matchModeMenuProps}>
              <span style={{ width: 60 }}>{matchMode.label}</span>
            </Dropdown.Button>
          </div>
          {/* 当匹配模式为单独选择扩展（而不是扩展组）时，支持搜索，以便快速找到想要的扩展 */}
          {matchMode?.key === "single" && (
            <SearchStyle>
              <input
                type="text"
                placeholder="Search"
                value={searchText}
                onChange={(e) => onSearchTextChange(e)}></input>
            </SearchStyle>
          )}
        </div>

        {matchMode?.key === "group" && (
          <div className="group-match-mode-container">
            <Dropdown menu={extGroupSelectMenuProps}>
              <Button>
                <Space>
                  {selectGroup?.name ?? "选择扩展组"}
                  <DownOutlined />
                </Space>
              </Button>
            </Dropdown>
          </div>
        )}

        <div className="extension-container">
          <h3>包含的扩展</h3>
          <ExtensionItems
            items={selectedExtensions}
            managementOptions={managementOptions}
            placeholder="无任何扩展"
            onClick={onSelectedExtensionClick}></ExtensionItems>

          {matchMode?.key === "single" && (
            <div className="unselected-extensions-container">
              <h3>未包含的扩展</h3>
              <ExtensionItems
                items={displayUnselectedExtensions}
                managementOptions={managementOptions}
                placeholder="无任何扩展"
                onClick={onUnselectedExtensionClick}></ExtensionItems>
            </div>
          )}
        </div>
      </Style>
    </EditorCommonStyle>
  )
}

export default memo(forwardRef(ExtensionSelector))
