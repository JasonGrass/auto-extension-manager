import React, {
  forwardRef,
  memo,
  useEffect,
  useImperativeHandle,
  useState
} from "react"

import { DownOutlined } from "@ant-design/icons"
import { Button, Checkbox, Dropdown, Radio, Space, Switch } from "antd"
import classNames from "classnames"

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
        refreshAfterClose: refreshAfterClose,
        isAdvanceMode: isShowAdvanceOptions,
        timeWhenEnable: timeWhenEnable,
        timeWhenDisable: timeWhenDisable
      }
    }
  }))

  const [actionType, setActionType] = useState(actionSelections[0])

  const [isShowAdvanceOptions, setIsShowAdvanceOptions] = useState(false)
  const [timeWhenEnable, setTimeWhenEnable] = useState("none")
  const [timeWhenDisable, setTimeWhenDisable] = useState("none")
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

    setIsShowAdvanceOptions(config?.isAdvanceMode ?? false)
    setTimeWhenEnable(config?.timeWhenEnable ?? "none")
    setTimeWhenDisable(config?.timeWhenDisable ?? "none")
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

  const onAdvanceOptionsChange = (checked) => {
    setIsShowAdvanceOptions(checked)
  }

  const onTimeWhenEnableChange = (e) => {
    setTimeWhenEnable(e.target.value)
  }
  const onTimeWhenDisableChange = (e) => {
    setTimeWhenDisable(e.target.value)
  }

  return (
    <EditorCommonStyle>
      <Style>
        <div className="header">
          <span className="title">动作</span>
          <label className="action-label advance-options">
            <span>高级选项</span>
            <Switch
              checked={isShowAdvanceOptions}
              onChange={onAdvanceOptionsChange}
              size="small"
            />
          </label>
        </div>

        <div className="action-container">
          <div
            className={classNames({
              "hidden-action-mode": isShowAdvanceOptions
            })}>
            <Dropdown menu={actionSelectMenuProps} trigger={["click"]}>
              <Button>
                <Space>
                  {actionType.label}
                  <DownOutlined />
                </Space>
              </Button>
            </Dropdown>
          </div>

          <label
            className={classNames([
              "action-label",
              { "hidden-action-mode": !isShowAdvanceOptions }
            ])}>
            <span>启用浏览器扩展的时机：</span>
            <Radio.Group
              value={timeWhenEnable}
              onChange={onTimeWhenEnableChange}>
              <Radio value="none">不自动启用</Radio>
              <Radio value="current">当前标签匹配时</Radio>
              <Radio value="notCurrent">当前标签不匹配时</Radio>
              <Radio value="any">任一标签匹配时</Radio>
              <Radio value="noAny">所有标签都不匹配时</Radio>
            </Radio.Group>
          </label>

          <label
            className={classNames([
              "action-label",
              { "hidden-action-mode": !isShowAdvanceOptions }
            ])}>
            <span>禁用浏览器扩展的时机：</span>
            <Radio.Group
              value={timeWhenDisable}
              onChange={onTimeWhenDisableChange}>
              <Radio value="none">不自动禁用</Radio>
              <Radio value="current">当前标签匹配时</Radio>
              <Radio value="notCurrent">当前标签不匹配时</Radio>
              <Radio value="any">任一标签匹配时</Radio>
              <Radio value="noAny">所有标签都不匹配时</Radio>
            </Radio.Group>
          </label>

          <div
            className={classNames([
              "action-label",
              "action-refresh-options",
              { "hidden-action-mode": !isShowAdvanceOptions }
            ])}>
            <Checkbox
              checked={refreshAfterOpen}
              onChange={onFreshAfterOpenChange}>
              打开插件之后，刷新当前页面
            </Checkbox>
            <Checkbox
              checked={refreshAfterClose}
              onChange={onFreshAfterCloseChange}>
              关闭插件之后，刷新当前页面
            </Checkbox>
          </div>
        </div>
      </Style>
    </EditorCommonStyle>
  )
}

export default memo(forwardRef(RuleAction))

export { actionSelections }
