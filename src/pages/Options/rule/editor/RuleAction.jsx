import React, {
  forwardRef,
  memo,
  useEffect,
  useImperativeHandle,
  useState
} from "react"

import { DownOutlined } from "@ant-design/icons"
import { Button, Checkbox, Dropdown, Space } from "antd"

import EditorCommonStyle from "./CommonStyle"
import Style from "./RuleActionStyle"

const actionSelections = [
  {
    label: "匹配后关闭",
    key: "closeWhenMatched"
  },
  {
    label: "匹配后打开",
    key: "openWhenMatched"
  },
  {
    label: "匹配才关闭",
    key: "closeOnlyWhenMatched"
  },
  {
    label: "匹配才打开",
    key: "openOnlyWhenMatched"
  }
]

const RuleAction = ({ config }, ref) => {
  useImperativeHandle(ref, () => ({
    // 获取配置
    getActionConfig: () => {
      if (!actionType) {
        throw Error("没有设置任何动作类型")
      }

      return {
        actionType: actionType.key,
        refreshAfterOpen: refreshAfterOpen,
        refreshAfterClose: refreshAfterClose
      }
    }
  }))

  const [actionType, setActionType] = useState(actionSelections[0])
  const [refreshAfterOpen, setRefreshAfterOpen] = useState(false)
  const [refreshAfterClose, setRefreshAfterClose] = useState(false)

  // 根据配置初始化
  useEffect(() => {
    const action = config?.actionType
    if (action) {
      setActionType(actionSelections.filter((m) => m.key === action)[0])
    } else {
      setActionType(actionSelections[0])
    }
    setRefreshAfterOpen(config?.refreshAfterOpen ?? false)
    setRefreshAfterClose(config?.refreshAfterClose ?? false)
  }, [config])

  const handleActionTypeClick = (e) => {
    const mode = actionSelections.filter((m) => m.key === e.key)[0]
    if (!mode) {
      return
    }
    setActionType(mode)
  }

  const actionSelectMenuProps = {
    items: actionSelections,
    onClick: handleActionTypeClick
  }

  const onFreshAfterOpenChange = (e) => {
    setRefreshAfterOpen(e.target.checked)
  }

  const onFreshAfterCloseChange = (e) => {
    setRefreshAfterClose(e.target.checked)
  }

  return (
    <EditorCommonStyle>
      <Style>
        <div className="header">
          <span className="title">动作</span>
        </div>

        <div className="action-container">
          <Dropdown menu={actionSelectMenuProps} trigger={["click"]}>
            <Button>
              <Space>
                {actionType.label}
                <DownOutlined />
              </Space>
            </Button>
          </Dropdown>

          <Checkbox
            checked={refreshAfterOpen}
            onChange={onFreshAfterOpenChange}>
            打开插件之后，刷新页面
          </Checkbox>
          <Checkbox
            checked={refreshAfterClose}
            onChange={onFreshAfterCloseChange}>
            关闭插件之后，刷新页面
          </Checkbox>
        </div>
      </Style>
    </EditorCommonStyle>
  )
}

export default memo(forwardRef(RuleAction))

export { actionSelections }
