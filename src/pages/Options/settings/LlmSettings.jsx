import React, { useEffect, useState } from "react"

import { QuestionCircleOutlined } from "@ant-design/icons"
import { AutoComplete, Button, Input, Space, Tooltip, message } from "antd"

import { LocalOptions } from ".../storage/local"
import { getLang } from ".../utils/utils"
import {
  chatCompletion,
  DEFAULT_LLM_CONFIG,
  isLlmConfigValid,
  listModels,
  normalizeBaseURL
} from ".../utils/llmClient"
import { ensureHostPermission } from ".../utils/llmPermissions"
import { llmErrorText } from "../utils/aiErrorText"

const localOptions = new LocalOptions()

/**
 * 设置页的「AI 功能设置」区块：配置 OpenAI 兼容的 LLM 服务。
 * 布局沿用页面统一的 .setting-item 行式风格（左标签 + 右控件 + 分隔线）。
 * apiKey 只存本地 IndexedDB（LocalOptions），不进 chrome.storage.sync，
 * 避免密钥随浏览器同步扩散到其他设备。
 */
function LlmSettings() {
  const [messageApi, contextHolder] = message.useMessage()

  const [baseURL, setBaseURL] = useState(DEFAULT_LLM_CONFIG.baseURL)
  const [apiKey, setApiKey] = useState("")
  const [model, setModel] = useState(DEFAULT_LLM_CONFIG.model)
  // 「获取模型列表」拉到的可选项，AutoComplete 同时支持手填
  const [modelOptions, setModelOptions] = useState([])

  const [testing, setTesting] = useState(false)
  const [fetching, setFetching] = useState(false)

  useEffect(() => {
    localOptions.getLlmConfig().then((config) => {
      if (config) {
        setBaseURL(config.baseURL)
        setApiKey(config.apiKey)
        setModel(config.model)
      }
    })
  }, [])

  // 保存前做规范化与完整性校验，通过后写入本地
  const saveConfig = async () => {
    const normalized = normalizeBaseURL(baseURL)
    if (normalized === null) {
      messageApi.error(getLang("ai_error_url_invalid"))
      return null
    }

    const config = {
      baseURL: normalized,
      apiKey: apiKey.trim(),
      model: model.trim()
    }
    if (!isLlmConfigValid(config)) {
      messageApi.warning(getLang("ai_error_no_config"))
      return null
    }

    await localOptions.setLlmConfig(config)
    return config
  }

  // MV3 下没有 host 权限会被 CORS 拦截；request 必须在用户手势内发起，
  // 由按钮点击链路调用。已授权时 Chrome 不会重复弹窗
  const ensurePermission = async (config) => {
    const granted = await ensureHostPermission(config.baseURL).catch(() => false)
    if (!granted) {
      messageApi.warning(getLang("ai_permission_denied"))
    }
    return granted
  }

  const onSave = async () => {
    const config = await saveConfig()
    if (!config) {
      return
    }
    messageApi.success(getLang("ai_setting_saved"))

    // 保存后立即申请网络权限（浏览器会弹授权框），避免留到使用时才失败；
    // 失败只提醒，不阻断保存
    ensurePermission(config)
  }

  const onFetchModels = async () => {
    const config = await saveConfig()
    if (!config) {
      return
    }
    if (!(await ensurePermission(config))) {
      return
    }

    setFetching(true)
    try {
      const ids = await listModels(config)
      setModelOptions(ids.map((id) => ({ value: id })))

      if (ids.length === 0) {
        messageApi.info(getLang("ai_setting_models_empty"))
      } else {
        // 当前填的 ID 不在服务返回的列表里时自动纠正为第一个，
        // 避免拿产品名当模型 ID（如 "DeepSeek V4 Flash"）导致的 404
        if (!ids.includes(model.trim())) {
          setModel(ids[0])
        }
        messageApi.success(`${getLang("ai_setting_models_ok")} (${ids.length})`)
      }
    } catch (error) {
      messageApi.error(`${getLang("ai_setting_test_fail")}: ${llmErrorText(error)}`)
    } finally {
      setFetching(false)
    }
  }

  const onTest = async () => {
    const config = await saveConfig()
    if (!config) {
      return
    }
    if (!(await ensurePermission(config))) {
      return
    }

    setTesting(true)
    const startedAt = Date.now()
    try {
      await chatCompletion([{ role: "user", content: "ping" }], config, { timeoutMs: 20000 })
      messageApi.success(`${getLang("ai_setting_test_ok")} (${Date.now() - startedAt}ms)`)
    } catch (error) {
      messageApi.error(`${getLang("ai_setting_test_fail")}: ${llmErrorText(error)}`)
    } finally {
      setTesting(false)
    }
  }

  return (
    <div>
      {contextHolder}
      <div className="setting-item">
        <span>{getLang("ai_setting_base_url")}</span>
        <Input
          style={{ width: 280 }}
          value={baseURL}
          placeholder={DEFAULT_LLM_CONFIG.baseURL}
          allowClear
          onChange={(e) => setBaseURL(e.target.value)}
        />
      </div>
      <div className="setting-item">
        <span>
          {getLang("ai_setting_api_key")}
          <Tooltip placement="top" title={getLang("ai_setting_privacy_note")}>
            <QuestionCircleOutlined />
          </Tooltip>
        </span>
        <Input.Password
          style={{ width: 280 }}
          value={apiKey}
          placeholder="sk-..."
          allowClear
          autoComplete="off"
          onChange={(e) => setApiKey(e.target.value)}
        />
      </div>
      <div className="setting-item">
        <span>{getLang("ai_setting_model")}</span>
        <Space>
          <AutoComplete
            style={{ width: 160 }}
            value={model}
            options={modelOptions}
            placeholder={DEFAULT_LLM_CONFIG.model}
            onChange={(value) => setModel(value ?? "")}
          />
          <Button loading={fetching} onClick={onFetchModels}>
            {getLang("ai_setting_fetch_models")}
          </Button>
        </Space>
      </div>
      <div className="setting-item">
        <span></span>
        <Space>
          <Button type="primary" onClick={onSave}>
            {getLang("ai_setting_save")}
          </Button>
          <Button loading={testing} onClick={onTest}>
            {getLang("ai_setting_test")}
          </Button>
        </Space>
      </div>
    </div>
  )
}

export default LlmSettings
