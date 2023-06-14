import React, {
  forwardRef,
  memo,
  useEffect,
  useImperativeHandle,
  useState
} from "react"

import { ClearOutlined, DownOutlined, PlusOutlined } from "@ant-design/icons"
import { Button, Dropdown, Input, Space, Switch, message } from "antd"

import EditorCommonStyle from "./CommonStyle"
import Style from "./MatchRuleStyle"

const matchModes = [
  {
    label: "域名",
    key: "host"
  },
  {
    label: "情景模式",
    key: "scene"
  }
]

const matchMethods = [
  {
    label: "通配符",
    key: "wildcard"
  },
  {
    label: "正则表达式",
    key: "regex"
  }
]

/*
sceneList
[
  {
    id: "1",
    name: "工作模式",
    desc: "描述",
    isActive: true
  }
]

config
{
    "matchMode": "host/scene",
    "matchScene": "scene id",
    "matchHost": [
      "*baidu.com*"
    ],
    "matchMethod": "regex/wildcard"
}

*/

const MatchRule = ({ sceneList, config }, ref) => {
  useImperativeHandle(ref, () => ({
    // 获取配置
    getMatchRuleConfig: () => {
      return {
        matchMode: matchMode.key,
        matchMethod: matchMethod.key,
        matchScene: matchScene.id,
        matchHost: matchHostList
      }
    }
  }))

  // 匹配模式，host / scene
  const [matchMode, setMatchMode] = useState(matchModes[0])
  // 域名匹配计算方法，regex / wildcard
  const [matchMethod, setMatchMethod] = useState(matchMethods[0])
  // 匹配情景模式 ID
  const [matchScene, setMatchScene] = useState({})
  // 域名列表
  const [matchHostList, setMatchHostList] = useState([])

  // const [editingConfig, setEditingConfig] = useState(config ?? {})

  useEffect(() => {
    if (config?.matchMode === "scene") {
      setMatchMode(matchModes[1])
    } else {
      setMatchMode(matchModes[0])
    }
    if (config?.matchMethod === "regex") {
      setMatchMethod(matchMethods[1])
    } else {
      setMatchMethod(matchMethods[0])
    }
    const sceneId = config?.matchScene ?? ""
    setMatchScene(sceneList.filter((s) => s.id === sceneId)[0])
    setMatchHostList(config?.matchHost ?? [""])
  }, [sceneList, config])

  const handleMatchModeClick = (e) => {
    const mode = matchModes.filter((m) => m.key === e.key)[0]
    if (!mode) {
      return
    }
    setMatchMode(mode)
  }

  const matchModeMenuProps = {
    items: matchModes,
    onClick: handleMatchModeClick
  }

  const onMatchMethodSwitchChanged = (e) => {
    if (e) {
      setMatchMethod(matchMethods[1])
    } else {
      setMatchMethod(matchMethods[0])
    }
  }

  const onAppendHostClick = (e) => {
    setMatchHostList([...matchHostList, ""])
  }

  const onRemoveHostClick = (e) => {
    const list = matchHostList.filter(
      (host) => host && host !== "" && host.trim() !== ""
    )
    setMatchHostList(list)
  }

  const onHostInputChanged = (e, index) => {
    const list = [...matchHostList]
    list[index] = e.target.value
    setMatchHostList(list)
  }

  return (
    <EditorCommonStyle>
      <Style>
        <div className="header">
          <span className="title">匹配</span>
          <div>
            <Dropdown.Button menu={matchModeMenuProps}>
              <span style={{ width: 60 }}>{matchMode.label}</span>
            </Dropdown.Button>
          </div>

          {matchMode.key === "host" && (
            <div className="match-method">
              <span className="match-method-title">是否使用正则</span>
              <Switch
                size="small"
                checked={matchMethod.key === "regex"}
                onChange={(e) => onMatchMethodSwitchChanged(e)}
              />
              <span className="match-method-label">
                匹配方式: {matchMethod.label}
              </span>
            </div>
          )}
        </div>

        {buildSceneSelectMenu(sceneList)}

        {matchMode.key === "host" && (
          <div className="host-match-mode-container">
            {matchHostList.map((host, index) => (
              <Input
                key={index}
                addonBefore="http(s)://"
                value={host}
                onChange={(e) => onHostInputChanged(e, index)}
              />
            ))}
            <Button onClick={onAppendHostClick}>
              <Space>
                添加域名
                <PlusOutlined />
              </Space>
            </Button>
            <Button onClick={onRemoveHostClick}>
              <Space>
                清除空白项
                <ClearOutlined />
              </Space>
            </Button>
          </div>
        )}
      </Style>
    </EditorCommonStyle>
  )

  function buildSceneSelectMenu(sceneList) {
    if (matchMode.key !== "scene") {
      return null
    }

    if (!sceneList || sceneList.length === 0) {
      return <p>没有创建任何情景模式，请先创建</p>
    }

    const sceneListMenuProps = {
      items: sceneList.map((scene) => ({
        key: scene.id,
        label: scene.name
      })),
      onClick: (e) => {
        // 用户选择的情景模式
        const selectScene = sceneList.filter((m) => m.id === e.key)[0]
        setMatchScene(selectScene)
      }
    }

    return (
      <div className="scene-match-mode-container">
        <Dropdown menu={sceneListMenuProps}>
          <Button>
            <Space>
              {matchScene?.name ?? "选择情景模式"}
              <DownOutlined />
            </Space>
          </Button>
        </Dropdown>
      </div>
    )
  }
}

export default memo(forwardRef(MatchRule))
