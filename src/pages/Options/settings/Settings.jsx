import React, { memo, useEffect, useState } from "react"

import { QuestionCircleOutlined } from "@ant-design/icons"
import { Button, Popconfirm, Slider, Switch, Tooltip, message } from "antd"
import { fromJS } from "immutable"

import storage from ".../storage"
import Title from "../Title.jsx"
import { exportConfig, importConfig } from "./ConfigFileBackup.ts"
import { MAX_COLUMN_COUNT, MIN_COLUMN_COUNT } from "./SettingConst.js"
import { SettingStyle } from "./SettingStyle.js"

function Settings() {
  const [setting, setSetting] = useState(null)

  // 是否显示 APP
  const [isShowApp, setIsShowApp] = useState(false)
  // 是否总是显示扩展操作按钮
  const [isShowItemOperationAlways, setIsShowItemOperationAlways] = useState(false)
  // 是否总是显示搜索栏
  const [isShowSearchBar, setIsShowSearchBar] = useState(false)
  // 是否支持跳转到应用商店搜索
  const [isSupportSearchAppStore, setIsSupportSearchAppStore] = useState(false)
  // 切换分组时，是否执行扩展启用与禁用
  const [isRaiseEnableWhenSwitchGroup, setIsRaiseEnableWhenSwitchGroup] = useState(false)
  // 是否在 Popup 中，展示固定分组中的扩展
  const [isShowFixedExtension, setIsShowFixedExtension] = useState(true)
  // 是否显示固定分组扩展上面的小圆点
  const [isShowDotOfFixedExtension, setIsShowDotOfFixedExtension] = useState(true)
  // 网格视图下，显示 APP 名称
  const [isShowAppNameInGirdView, setIsShowAppNameInGirdView] = useState(false)
  // 网格视图下，每行显示的扩展个数
  const [columnCountInGirdView, setColumnCountInGirdView] = useState(6)
  // 网格视图下，禁用扩展使用灰色样式
  const [isGaryStyleOfDisableInGridView, setIsGaryStyleOfDisableInGridView] = useState(false)
  // Popup 中，按照频率进行排序
  const [isSortByFrequency, setIsSortByFrequency] = useState(false)

  const [messageApi, contextHolder] = message.useMessage()

  // 初始化
  useEffect(() => {
    if (setting == null) {
      return
    }

    const showApp = setting.isShowApp ?? false
    setIsShowApp(showApp)
    const showItemOperationAlways = setting.isShowItemOperationAlways ?? false
    setIsShowItemOperationAlways(showItemOperationAlways)
    const showSearchBar = setting.isShowSearchBarDefault ?? false
    setIsShowSearchBar(showSearchBar)
    const raiseEnableWhenSwitchGroup = setting.isRaiseEnableWhenSwitchGroup ?? false
    setIsRaiseEnableWhenSwitchGroup(raiseEnableWhenSwitchGroup)
    const showFixedExtension = setting.isShowFixedExtension ?? true
    setIsShowFixedExtension(showFixedExtension)
    const showAppNameInGridView = setting.isShowAppNameInGirdView ?? false
    setIsShowAppNameInGirdView(showAppNameInGridView)
    const supportSearchAppStore = setting.isSupportSearchAppStore ?? false
    setIsSupportSearchAppStore(supportSearchAppStore)
    const sortByFrequency = setting.isSortByFrequency ?? false
    setIsSortByFrequency(sortByFrequency)

    // 网格视图下的列数
    let tempColumnInGirdView = Number(setting.columnCountInGirdView)
    if (
      Number.isNaN(tempColumnInGirdView) ||
      tempColumnInGirdView < MIN_COLUMN_COUNT ||
      tempColumnInGirdView > MAX_COLUMN_COUNT
    ) {
      tempColumnInGirdView = MIN_COLUMN_COUNT
    }
    setColumnCountInGirdView(tempColumnInGirdView)

    // 禁用扩展使用灰色样式
    const grayWhenDisable = setting.isGaryStyleOfDisableInGridView ?? false
    setIsGaryStyleOfDisableInGridView(grayWhenDisable)

    // 固定分组扩展的小圆点
    const dotOfFixedExtension = setting.isShowDotOfFixedExtension ?? true
    setIsShowDotOfFixedExtension(dotOfFixedExtension)
  }, [setting])

  // 初始化，从配置中读取设置
  useEffect(() => {
    storage.options.getAll().then((options) => {
      setSetting(options.setting)
    })
  }, [])

  const onSettingChange = (value, settingHandler, optionKey) => {
    settingHandler(value)
    storage.options.getAll().then((options) => {
      // 将新配置，合并到已经存在的 setting中，然后更新到 storage 中
      const setting = fromJS(options.setting).set(optionKey, value).toJS()
      storage.options.set({ setting: setting })
    })
  }

  const onImportConfig = async () => {
    if (await importConfig()) {
      messageApi.open({
        type: "success",
        content: "导入完成"
      })
    } else {
      messageApi.open({
        type: "error",
        content: "导入失败"
      })
    }
  }
  const onExportConfig = () => {
    exportConfig()
  }

  /**
   * 恢复默认，将通用设置恢复成默认配置
   */
  const onRestoreDefault = () => {
    storage.options.set({ setting: {} })
    setSetting({})
  }

  /**
   * 清空所有配置
   */
  const onClearAllOptions = async () => {
    await chrome.storage.sync.clear()
    chrome.tabs.reload()
  }

  return (
    <SettingStyle>
      {contextHolder}
      <Title title="通用设置"></Title>

      <h2 className="setting-sub-title">Popup 显示偏好设置</h2>

      <div className="container">
        <div className="setting-item">
          <span>
            搜索框：默认显示（未开启时点击 🔍 显示）
            <Tooltip placement="top" title="也可以使用快捷键 'F' 打开搜索框">
              <QuestionCircleOutlined />
            </Tooltip>{" "}
          </span>
          <Switch
            size="small"
            checked={isShowSearchBar}
            onChange={(value) =>
              onSettingChange(value, setIsShowSearchBar, "isShowSearchBarDefault")
            }></Switch>
        </div>

        <div className="setting-item">
          <span>
            搜索框：支持跳转应用商店搜索{" "}
            <Tooltip
              placement="top"
              title="开启之后，可以跳转到浏览器应用商店搜索扩展（支持 Enter 快捷跳转）">
              <QuestionCircleOutlined />
            </Tooltip>{" "}
          </span>
          <Switch
            size="small"
            checked={isSupportSearchAppStore}
            onChange={(value) =>
              onSettingChange(value, setIsSupportSearchAppStore, "isSupportSearchAppStore")
            }></Switch>
        </div>

        <div className="setting-item">
          <span>
            显示 APP 类型的扩展{" "}
            <Tooltip
              placement="top"
              title="将在 Popup 底部显示 APP 类型的扩展，点击图标，可以直接启动应用">
              <QuestionCircleOutlined />
            </Tooltip>{" "}
          </span>
          <Switch
            size="small"
            checked={isShowApp}
            onChange={(value) => onSettingChange(value, setIsShowApp, "isShowApp")}></Switch>
        </div>

        <div className="setting-item">
          <span>
            显示固定分组中的扩展{" "}
            <Tooltip
              placement="top"
              title="固定分组中的扩展，通常为常驻扩展，如果不想在 Popup 列表中展示，可以关闭此选项">
              <QuestionCircleOutlined />
            </Tooltip>{" "}
          </span>
          <Switch
            size="small"
            checked={isShowFixedExtension}
            onChange={(value) =>
              onSettingChange(value, setIsShowFixedExtension, "isShowFixedExtension")
            }></Switch>
        </div>

        <div className="setting-item">
          <span>显示固定分组扩展右上角的小圆点</span>
          <Switch
            size="small"
            checked={isShowDotOfFixedExtension}
            onChange={(value) =>
              onSettingChange(value, setIsShowDotOfFixedExtension, "isShowDotOfFixedExtension")
            }></Switch>
        </div>

        <div className="setting-item">
          <span>列表视图下，始终显示快捷操作按钮（默认 hover 显示）</span>
          <Switch
            size="small"
            checked={isShowItemOperationAlways}
            onChange={(value) =>
              onSettingChange(value, setIsShowItemOperationAlways, "isShowItemOperationAlways")
            }></Switch>
        </div>

        <div className="setting-item">
          <span>
            网格视图下，显示 APP 名称{" "}
            <Tooltip placement="top" title="如果设置了扩展别名，将优先显示别名">
              <QuestionCircleOutlined />
            </Tooltip>{" "}
          </span>
          <Switch
            size="small"
            checked={isShowAppNameInGirdView}
            onChange={(value) =>
              onSettingChange(value, setIsShowAppNameInGirdView, "isShowAppNameInGirdView")
            }></Switch>
        </div>

        <div className="setting-item">
          <span>网格视图下，扩展显示的列数（{columnCountInGirdView}）</span>
          <Slider
            style={{ width: 100, margin: "0 10px 0 0" }}
            defaultValue={30}
            value={columnCountInGirdView}
            onChange={(value) =>
              onSettingChange(value, setColumnCountInGirdView, "columnCountInGirdView")
            }
            min={MIN_COLUMN_COUNT}
            max={MAX_COLUMN_COUNT}
            step={1}
          />
        </div>

        <div className="setting-item">
          <span>网格视图下，使用灰色样式显示被禁用的扩展</span>
          <Switch
            size="small"
            checked={isGaryStyleOfDisableInGridView}
            onChange={(value) =>
              onSettingChange(
                value,
                setIsGaryStyleOfDisableInGridView,
                "isGaryStyleOfDisableInGridView"
              )
            }></Switch>
        </div>

        <div className="setting-item">
          <span>
            排序：按照启用频率进行排序{" "}
            <Tooltip placement="top" title="默认按照名称排序">
              <QuestionCircleOutlined />
            </Tooltip>{" "}
          </span>
          <Switch
            size="small"
            checked={isSortByFrequency}
            onChange={(value) =>
              onSettingChange(value, setIsSortByFrequency, "isSortByFrequency")
            }></Switch>
        </div>
      </div>

      <h2 className="setting-sub-title">Popup 功能偏好设置</h2>

      <div className="container">
        <div className="setting-item">
          <span>
            切换分组时，启用当前分组扩展，禁用其它的扩展{" "}
            <Tooltip
              placement="top"
              title="打开此配置之后，在 Popup 中切换分组时，会禁用掉所有不是固定分组也不是当前分组中的扩展">
              <QuestionCircleOutlined />
            </Tooltip>{" "}
          </span>
          <Switch
            size="small"
            checked={isRaiseEnableWhenSwitchGroup}
            onChange={(value) =>
              onSettingChange(
                value,
                setIsRaiseEnableWhenSwitchGroup,
                "isRaiseEnableWhenSwitchGroup"
              )
            }></Switch>
        </div>
      </div>

      <div className="import-export-container">
        <Button onClick={onImportConfig}>导入配置</Button>
        <Button onClick={onExportConfig}>导出配置</Button>
        <Tooltip placement="top" title="将通用设置重置为默认">
          <Button onClick={onRestoreDefault}>恢复默认</Button>
        </Tooltip>

        <Popconfirm
          title="删除所有配置"
          description={`此操作将删除情景模式、分组、别名、规则等所有数据`}
          onConfirm={onClearAllOptions}
          onCancel={(e) => e.stopPropagation()}
          okText="Yes"
          cancelText="Cancel"
          onClick={(e) => e.stopPropagation()}>
          <Tooltip placement="right" title="清空所有的配置数据">
            <Button danger>清空配置</Button>
          </Tooltip>
        </Popconfirm>
      </div>
    </SettingStyle>
  )
}

export default memo(Settings)
