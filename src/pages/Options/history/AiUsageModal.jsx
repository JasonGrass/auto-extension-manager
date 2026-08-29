import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

import { SafetyOutlined } from "@ant-design/icons"
import { Alert, Button, List, Modal, Popconfirm, Space, Tag, Typography, message } from "antd"
import chromeP from "webext-polyfill-kinda"

import { LocalOptions } from ".../storage/local"
import { getLang } from ".../utils/utils"
import { filterExtensions, isExtExtension } from ".../utils/extensionHelper"
import { chatJson, isLlmConfigValid } from ".../utils/llmClient"
import { ensureHostPermission } from ".../utils/llmPermissions"
import { ExtensionRepo } from "../../Background/extension/ExtensionRepo"
import { HistoryRepo } from "../../Background/history/HistoryRepo"
import { HistoryService } from "../../Background/history/HistoryService"
import { llmErrorText } from "../utils/aiErrorText"
import AiProgress from "../components/AiProgress"
import { buildUsageMessages, validateUsageSuggestions } from "./aiUsagePrompt"
import { buildUsageStats } from "./usageStats"

const { Text } = Typography
const localOptions = new LocalOptions()

/**
 * AI 减负分析弹窗。
 *
 * 流程：代码先算使用统计和候选（确定性规则）→ LLM 只做归纳和措辞 →
 * 用户逐条确认后执行禁用/卸载。禁用走 management.setEnabled，
 * 卸载走 management.uninstall 并弹 Chrome 原生确认框，双层确认。
 */
function AiUsageModal({ open, onClose }) {
  const navigate = useNavigate()
  const [messageApi, contextHolder] = message.useMessage()

  const [loading, setLoading] = useState(false)
  const [summary, setSummary] = useState("")
  // [{type, extensionIds, reason}]
  const [suggestions, setSuggestions] = useState([])
  // 扩展 id → 名称，用于列表展示和复制结果
  const [nameMap, setNameMap] = useState(() => new Map())
  // 已执行过的建议下标，避免重复操作
  const [doneIndexSet, setDoneIndexSet] = useState(() => new Set())
  const [acting, setActing] = useState(false)
  const [hasRun, setHasRun] = useState(false)

  useEffect(() => {
    if (open) {
      setSummary("")
      setSuggestions([])
      setDoneIndexSet(new Set())
      setHasRun(false)
    }
  }, [open])

  const ensureConfig = async () => {
    const config = await localOptions.getLlmConfig()
    if (isLlmConfigValid(config)) {
      return config
    }
    messageApi.warning(getLang("ai_error_no_config"))
    navigate("/setting")
    return null
  }

  const loadData = async () => {
    const repo = new HistoryRepo()
    const service = new HistoryService(repo)
    const records = await service.queryAll()

    const all = await chromeP.management.getAll()
    const extensions = filterExtensions(all, isExtExtension)

    // 图标不在统计里用到，这里不填充，保持数据量最小
    const extRepo = new ExtensionRepo()
    const withCache = await Promise.all(
      extensions.map(async (ext) => {
        const cache = await extRepo.get(ext.id)
        return cache ?? ext
      })
    )

    return { records, extensions: withCache }
  }

  const runAnalysis = async () => {
    const config = await ensureConfig()
    if (!config) {
      return
    }
    // 无 host 权限时 MV3 会拦截跨域请求（表现为「网络错误」），先申请
    const granted = await ensureHostPermission(config.baseURL).catch(() => false)
    if (!granted) {
      messageApi.warning(getLang("ai_permission_denied"))
      return
    }

    setLoading(true)
    try {
      const { records, extensions } = await loadData()
      const stats = buildUsageStats(records, extensions, Date.now())

      const names = new Map()
      for (const ext of extensions) {
        names.set(ext.id, ext.name ?? ext.id)
      }
      setNameMap(names)

      const messages = buildUsageMessages(
        stats.extStats,
        stats.candidates,
        chrome.i18n.getUILanguage()
      )
      // 减负分析的输出也比测试连接长得多，深度思考类模型 60 秒常不够，
      // 与分组建议保持一致放宽到 120 秒
      const parsed = await chatJson(messages, config, { timeoutMs: 120000 })
      const valid = validateUsageSuggestions(parsed, {
        validIds: stats.extStats.map((stat) => stat.id)
      })

      setSummary(valid.summary)
      setSuggestions(valid.suggestions)
      if (valid.suggestions.length === 0) {
        messageApi.info(getLang("ai_usage_empty"))
      }
    } catch (error) {
      messageApi.error(llmErrorText(error))
    } finally {
      setLoading(false)
      setHasRun(true)
    }
  }

  const markDone = (index) => {
    setDoneIndexSet((prev) => new Set(prev).add(index))
  }

  const disableIds = async (index, ids) => {
    setActing(true)
    try {
      for (const id of ids) {
        try {
          await chromeP.management.setEnabled(id, false)
        } catch {
          // 单个失败不影响其余
        }
      }
      markDone(index)
      messageApi.success(getLang("ai_usage_disabled_ok"))
    } finally {
      setActing(false)
    }
  }

  const uninstallIds = async (index, ids) => {
    setActing(true)
    try {
      for (const id of ids) {
        try {
          // showConfirmDialog 会弹 Chrome 原生确认框，用户可拒绝
          await chromeP.management.uninstall(id, { showConfirmDialog: true })
        } catch {
          // 用户取消卸载时 Chrome 会走 error 回调，这里静默跳过
        }
      }
      markDone(index)
    } finally {
      setActing(false)
    }
  }

  const copyResult = async () => {
    const lines = [summary, ""]
    for (const item of suggestions) {
      const nameList = item.extensionIds.map((id) => nameMap.get(id) ?? id).join(", ")
      lines.push(`[${item.type}] ${nameList} - ${item.reason}`)
    }
    await navigator.clipboard.writeText(lines.join("\n"))
    messageApi.success(getLang("ai_copied"))
  }

  const typeTag = (type) => {
    const config = {
      disable: { color: "orange", text: getLang("ai_usage_type_disable") },
      uninstall: { color: "red", text: getLang("ai_usage_type_uninstall") },
      review: { color: "blue", text: getLang("ai_usage_type_review") }
    }
    const item = config[type] ?? config.review
    return <Tag color={item.color}>{item.text}</Tag>
  }

  return (
    <Modal
      title={
        <Space>
          <SafetyOutlined />
          {getLang("ai_usage_title")}
        </Space>
      }
      open={open}
      onCancel={onClose}
      width={640}
      footer={
        <Space>
          {suggestions.length > 0 && <Button onClick={copyResult}>{getLang("ai_copy")}</Button>}
          <Button onClick={onClose}>{getLang("ai_cancel")}</Button>
          <Button type="primary" loading={loading} onClick={runAnalysis}>
            {hasRun ? getLang("ai_regenerate") : getLang("ai_usage_run")}
          </Button>
        </Space>
      }>
      {contextHolder}
      <Alert
        type="info"
        showIcon
        message={getLang("ai_data_notice")}
        style={{ marginBottom: 16 }}
      />

      {/* 等待期间给出时间预期 + 计时进度条，避免用户以为卡死而提前关窗 */}
      {loading && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ color: "#999", fontSize: 12, marginBottom: 4 }}>
            {getLang("ai_running_tip")}
          </div>
          <AiProgress loading={loading} expectedMs={90000} />
        </div>
      )}

      {summary && (
        <div style={{ marginBottom: 16 }}>
          <Text type="secondary">{getLang("ai_usage_summary_title")}</Text>
          <p>{summary}</p>
        </div>
      )}

      <List
        loading={loading}
        dataSource={suggestions}
        locale={{ emptyText: hasRun ? getLang("ai_usage_empty") : getLang("ai_usage_hint") }}
        renderItem={(item, index) => (
          <List.Item
            actions={
              doneIndexSet.has(index)
                ? [
                    <Tag key="done" color="green">
                      {getLang("ai_usage_done")}
                    </Tag>
                  ]
                : item.type === "disable"
                  ? [
                      <Popconfirm
                        key="disable"
                        title={getLang("ai_usage_disable_confirm")}
                        onConfirm={() => disableIds(index, item.extensionIds)}
                        okText="Yes"
                        cancelText="No">
                        <Button size="small" loading={acting}>
                          {getLang("ai_usage_type_disable")}
                        </Button>
                      </Popconfirm>
                    ]
                  : item.type === "uninstall"
                    ? [
                        <Popconfirm
                          key="uninstall"
                          title={getLang("ai_usage_uninstall_confirm")}
                          onConfirm={() => uninstallIds(index, item.extensionIds)}
                          okText="Yes"
                          cancelText="No">
                          <Button size="small" danger loading={acting}>
                            {getLang("ai_usage_type_uninstall")}
                          </Button>
                        </Popconfirm>
                      ]
                    : []
            }>
            <List.Item.Meta
              title={
                <Space>
                  {typeTag(item.type)}
                  {item.extensionIds.map((id) => (
                    <Tag key={id}>{nameMap.get(id) ?? id}</Tag>
                  ))}
                </Space>
              }
              description={item.reason}
            />
          </List.Item>
        )}
      />
    </Modal>
  )
}

export default AiUsageModal
