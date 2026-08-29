import React, { useEffect, useMemo, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"

import { EditOutlined, RobotOutlined } from "@ant-design/icons"
import { Alert, Button, Checkbox, Input, List, Modal, Radio, Space, Tag, message } from "antd"

import { LocalOptions } from ".../storage/local"
import storage from ".../storage/sync"
import { getLang } from ".../utils/utils"
import { chatJson, isLlmConfigValid } from ".../utils/llmClient"
import { ensureHostPermission } from ".../utils/llmPermissions"
import { llmErrorText } from "../utils/aiErrorText"
import AiProgress from "../components/AiProgress"
import {
  BATCH_SIZE,
  PRESET_GROUP_NAMES,
  buildGroupMessages,
  buildMergeCheckMessages,
  validateGroupSuggestions,
  validateMergeSuggestions
} from "./aiGroupPrompt"

const localOptions = new LocalOptions()

/**
 * AI 分组建议弹窗。
 *
 * 原则：LLM 只给建议，创建分组必须由用户勾选后手动应用，
 * 且应用前会再经过 validateGroupSuggestions 的 id/重名过滤。
 */
function AiGroupSuggestModal({ open, onClose, onApplied, extensions, groupListInfo }) {
  const navigate = useNavigate()
  const [messageApi, contextHolder] = message.useMessage()

  // 建议范围：仅未分组扩展（默认，不干扰现有整理）或全部扩展
  const [scope, setScope] = useState("ungrouped")
  // 附加权限信息给模型（帮助识别没有描述的扩展），会增加请求体积，默认关闭
  const [includePerms, setIncludePerms] = useState(false)
  const [loading, setLoading] = useState(false)
  const [applying, setApplying] = useState(false)
  // 分批分析时显示"第 x / N 批"
  const [batchText, setBatchText] = useState("")
  const [progressExpectedMs, setProgressExpectedMs] = useState(90000)
  // [{name, desc, extensionIds, checked}] 新建组的建议
  const [suggestions, setSuggestions] = useState([])
  // [{name, extensionIds, checked}] 与现有分组同名的建议，勾选后并入现有组
  const [merges, setMerges] = useState([])
  // [{from, to, checked}] 语义冗余的分组合并建议（from 组并入 to 组后删除 from）
  const [groupMerges, setGroupMerges] = useState([])
  const [hasRun, setHasRun] = useState(false)

  // 预设分组名单：优先用用户自定义（持久化在本地 IndexedDB），否则用内置默认。
  // 弹窗内可编辑（增删组名），保存后分析、白名单校验、标签展示全部跟随
  const [presetNames, setPresetNames] = useState(PRESET_GROUP_NAMES)
  const [editingPreset, setEditingPreset] = useState(false)
  const [newPresetName, setNewPresetName] = useState("")

  // 停止分析：cancelRef 让批次循环在下一轮退出；abortRef 中断当前飞行中的请求
  const cancelRef = useRef(false)
  const abortRef = useRef(null)

  useEffect(() => {
    // 每次打开都重置，避免展示上一次会话的旧建议
    if (open) {
      setSuggestions([])
      setMerges([])
      setGroupMerges([])
      setHasRun(false)
      setScope("ungrouped")
      setBatchText("")
      setEditingPreset(false)
      setNewPresetName("")

      localOptions.getValue("presetGroupNames").then((saved) => {
        if (Array.isArray(saved) && saved.length > 0) {
          setPresetNames(saved)
        } else {
          setPresetNames(PRESET_GROUP_NAMES)
        }
      })
    }
  }, [open])

  const existingGroupNames = useMemo(
    () => (groupListInfo ?? []).map((group) => group.name).filter(Boolean),
    [groupListInfo]
  )

  const nameById = useMemo(() => {
    const map = new Map()
    for (const ext of extensions ?? []) {
      map.set(ext.id, ext.name ?? ext.id)
    }
    return map
  }, [extensions])

  // 未分组 = 不属于任何分组的扩展（fixed/hidden 本身也是分组）
  const scopedExtensions = useMemo(() => {
    if (scope === "all") {
      return extensions ?? []
    }
    const groupedIds = new Set((groupListInfo ?? []).flatMap((group) => group.extensions ?? []))
    return (extensions ?? []).filter((ext) => !groupedIds.has(ext.id))
  }, [scope, extensions, groupListInfo])

  const ensureConfig = async () => {
    const config = await localOptions.getLlmConfig()
    if (isLlmConfigValid(config)) {
      return config
    }
    messageApi.warning(getLang("ai_error_no_config"))
    navigate("/setting")
    return null
  }

  // 无 host 权限时 MV3 会拦截跨域请求（表现为「网络错误」），先申请
  const ensurePermissionOrWarn = async (config) => {
    const granted = await ensureHostPermission(config.baseURL).catch(() => false)
    if (!granted) {
      messageApi.warning(getLang("ai_permission_denied"))
      return false
    }
    return true
  }

  // 单批分析（预设分组模式）：模型只把扩展分配到预设组（用户可自定义名单），
  // 组名白名单校验，不自由发挥。retry 用于批内对难题补跑一次
  const analyzeBatch = async (config, batchExtensions, withPerms, retry = false) => {
    const controller = new AbortController()
    abortRef.current = controller
    const { messages, idByNo } = buildGroupMessages(
      batchExtensions,
      presetNames,
      chrome.i18n.getUILanguage(),
      { retry, includePermissions: withPerms, presetGroups: presetNames }
    )
    const parsed = await chatJson(messages, config, {
      timeoutMs: 120000,
      signal: controller.signal
    })
    return validateGroupSuggestions(parsed, {
      extensions: batchExtensions,
      existingGroupNames: [],
      idByNo,
      allowedNames: presetNames,
      maxGroups: presetNames.length,
      // 预设组的粒度由框架决定，不适用"至少 8 个"的碎组过滤
      minPerGroup: 1
    })
  }

  // 停止分析：标记取消 + 中断当前飞行中的请求（已完成批次的结果保留）
  const stopAnalyze = () => {
    cancelRef.current = true
    abortRef.current?.abort()
  }

  // ===== 预设分组编辑 =====

  const savePresetNames = async (names) => {
    setPresetNames(names)
    await localOptions.setValue("presetGroupNames", names)
  }

  const addPresetName = async () => {
    const name = newPresetName.trim()
    // 与 NAME_MAX_LEN 保持一致：组名上限 8 字，至少 2 字
    if (name.length < 2 || name.length > 8) {
      messageApi.warning(getLang("ai_group_preset_invalid"))
      return
    }
    const duplicated = presetNames.some((item) => item.toLowerCase() === name.toLowerCase())
    if (duplicated) {
      messageApi.warning(getLang("ai_group_preset_duplicate"))
      return
    }
    setNewPresetName("")
    await savePresetNames([...presetNames, name])
  }

  const removePresetName = async (name) => {
    if (presetNames.length <= 1) {
      messageApi.warning(getLang("ai_group_preset_invalid"))
      return
    }
    await savePresetNames(presetNames.filter((item) => item !== name))
  }

  // 重命名单个预设分组：编辑态里点标签上的铅笔，原地变输入框
  const [renamingKey, setRenamingKey] = useState(null)
  const [renameValue, setRenameValue] = useState("")

  const startPresetRename = (name) => {
    setRenamingKey(name)
    setRenameValue(name)
  }

  const confirmPresetRename = async () => {
    if (renamingKey === null) {
      return
    }
    const oldName = renamingKey
    const newName = renameValue.trim()
    setRenamingKey(null)
    if (newName === oldName) {
      return
    }
    // 与 NAME_MAX_LEN 保持一致：组名上限 8 字，至少 2 字；不能和其他组重名
    if (newName.length < 2 || newName.length > 8) {
      messageApi.warning(getLang("ai_group_preset_invalid"))
      return
    }
    const duplicated = presetNames.some(
      (item) => item !== oldName && item.toLowerCase() === newName.toLowerCase()
    )
    if (duplicated) {
      messageApi.warning(getLang("ai_group_preset_duplicate"))
      return
    }
    await savePresetNames(presetNames.map((item) => (item === oldName ? newName : item)))
  }

  const finishPresetEdit = async () => {
    if (presetNames.length === 0) {
      messageApi.warning(getLang("ai_group_preset_invalid"))
      return
    }
    await localOptions.setValue("presetGroupNames", presetNames)
    setEditingPreset(false)
    messageApi.success(getLang("ai_group_preset_saved"))
  }

  const resetPresetNames = async () => {
    await savePresetNames(PRESET_GROUP_NAMES)
    messageApi.success(getLang("ai_group_preset_saved"))
  }

  // 跨批累积：同名建议合并成员，保证组名全局唯一
  const accumulateInto = (acc, items) => {
    for (const item of items) {
      const key = item.name.toLowerCase()
      const exist = acc.get(key)
      if (exist) {
        exist.extensionIds = [...new Set([...exist.extensionIds, ...item.extensionIds])]
      } else {
        acc.set(key, { ...item, extensionIds: [...item.extensionIds] })
      }
    }
  }

  const runSuggest = async () => {
    const config = await ensureConfig()
    if (!config) {
      return
    }
    if (!(await ensurePermissionOrWarn(config))) {
      return
    }

    // 范围内没有可分析的扩展时，模型只会返回空建议，不发请求直接提示，
    // 避免用户误以为功能坏了（比如所有扩展都已分组，需要切到「全部扩展」）
    if (scopedExtensions.length === 0) {
      console.log("[AI Group] 当前范围内没有扩展，跳过分析")
      setHasRun(true)
      messageApi.info(getLang("ai_group_no_ext"))
      return
    }

    // 分批：超过 ~50 个后模型对清单中后段的注意力明显下降，必须切片分析
    const batches = []
    for (let i = 0; i < scopedExtensions.length; i += BATCH_SIZE) {
      batches.push(scopedExtensions.slice(i, i + BATCH_SIZE))
    }
    setProgressExpectedMs(batches.length * 60000)
    cancelRef.current = false

    setLoading(true)
    const suggestionAcc = new Map()
    const mergeAcc = new Map()

    // 预设模式下组名是固定的：用户已有同名预设组 → 建议转为「并入」，
    // 没有的 → 新建。拆分在累积时按当前分组列表判定
    const existingNormalNames = new Set(
      (groupListInfo ?? [])
        .filter((group) => !storage.helper.isSpecialGroup(group) && group.name)
        .map((group) => group.name)
    )

    // 把累积结果写入 state。正常完成和用户中途停止都要走：
    // 停止时已完成批次的结果不白跑，直接可勾选应用
    const finalize = (stopped) => {
      const finalSuggestions = [...suggestionAcc.values()]
      const finalMerges = [...mergeAcc.values()]
      if (
        finalSuggestions.length === 0 &&
        finalMerges.length === 0 &&
        !stopped &&
        !cancelRef.current
      ) {
        messageApi.info(getLang("ai_group_empty"))
      }
      setSuggestions(finalSuggestions.map((item) => ({ ...item, checked: true })))
      setMerges(finalMerges.map((item) => ({ ...item, checked: true })))
    }

    try {
      for (let i = 0; i < batches.length; i++) {
        if (cancelRef.current) {
          break
        }
        setBatchText(getLang("ai_group_batch_progress", i + 1, batches.length))

        let result = await analyzeBatch(config, batches[i], includePerms)

        // 批内重试：对本批未被任何建议覆盖的扩展，换"难题"措辞再攻一次
        if (!cancelRef.current) {
          const covered = new Set()
          for (const s of result.suggestions) {
            s.extensionIds.forEach((id) => covered.add(id))
          }
          for (const m of result.merges) {
            m.extensionIds.forEach((id) => covered.add(id))
          }
          const uncovered = batches[i].filter((ext) => !covered.has(ext.id))
          if (uncovered.length > 0) {
            const retryResult = await analyzeBatch(config, uncovered, includePerms, true)
            result = {
              suggestions: [...result.suggestions, ...retryResult.suggestions],
              merges: [...result.merges, ...retryResult.merges]
            }
          }
        }

        for (const item of result.suggestions) {
          accumulateInto(existingNormalNames.has(item.name) ? mergeAcc : suggestionAcc, [item])
        }
        accumulateInto(mergeAcc, result.merges)
      }

      finalize(false)

      // 冗余检查：分批分析容易产生语义相近的组（「AI助手」/「AI对话」），
      // 跑完后把现有普通分组名 + 本次新建组名再交给模型找一遍冗余，
      // 给出「from 并入 to」的清理建议（也顺带清理用户历史上累积的冗余组）
      if (cancelRef.current) {
        messageApi.info(getLang("ai_group_stopped"))
        return
      }

      setBatchText(getLang("ai_group_cleanup_running"))
      const checkTargets = (groupListInfo ?? [])
        .filter((group) => !storage.helper.isSpecialGroup(group) && group.name)
        .map((group) => group.name)
        .concat(finalSuggestions.map((item) => item.name))

      if (checkTargets.length >= 3) {
        try {
          const mergeMessages = buildMergeCheckMessages(
            [...new Set(checkTargets)],
            chrome.i18n.getUILanguage()
          )
          const controller = new AbortController()
          abortRef.current = controller
          const mergeParsed = await chatJson(mergeMessages, config, {
            timeoutMs: 60000,
            signal: controller.signal
          })
          const cleanup = validateMergeSuggestions(mergeParsed, [...new Set(checkTargets)])
          setGroupMerges(cleanup.map((item) => ({ ...item, checked: true })))
        } catch (error) {
          if (error?.code !== "ABORTED") {
            // 冗余检查是附加步骤，失败不影响主建议的展示
            console.warn("[AI Group] 冗余检查失败:", error)
          }
        }
      }
    } catch (error) {
      if (error?.code === "ABORTED" || cancelRef.current) {
        // 用户主动停止：保留已完成批次的结果
        finalize(true)
        messageApi.info(getLang("ai_group_stopped"))
      } else {
        console.error("[AI Group] 分析失败:", error)
        messageApi.error(llmErrorText(error))
      }
    } finally {
      setLoading(false)
      setHasRun(true)
      setBatchText("")
      abortRef.current = null
    }
  }

  const applySuggestions = async () => {
    const checked = suggestions.filter((item) => item.checked)
    const checkedMerges = merges.filter((item) => item.checked)
    const checkedGroupMerges = groupMerges.filter((item) => item.checked)
    if (checked.length === 0 && checkedMerges.length === 0 && checkedGroupMerges.length === 0) {
      return
    }

    setApplying(true)
    let failed = 0
    try {
      for (const item of checked) {
        try {
          await storage.group.addGroup({
            name: item.name,
            desc: item.desc,
            extensions: item.extensionIds
          })
        } catch {
          // 单组失败（如并发下重名）不影响其他组
          failed += 1
        }
      }

      // 并入现有分组：把勾选的扩展追加到同名组的 extensions 里。
      // 固定/隐藏分组是系统组，语义上不该被 AI 动，跳过
      for (const item of checkedMerges) {
        try {
          const target = (groupListInfo ?? []).find(
            (group) => group.name === item.name && !storage.helper.isSpecialGroup(group)
          )
          if (!target) {
            failed += 1
            continue
          }
          await storage.group.update({
            id: target.id,
            extensions: [...new Set([...(target.extensions ?? []), ...item.extensionIds])]
          })
        } catch {
          failed += 1
        }
      }

      // 冗余清理：from 组的成员全部迁入 to 组后删除 from 组。
      // 每条都实时读最新分组（to 组可能是本次刚新建的，groupListInfo 里还没有）
      for (const item of checkedGroupMerges) {
        try {
          const groups = await storage.group.getGroups()
          const findByName = (name) =>
            groups.find(
              (group) => group && group.name === name && !storage.helper.isSpecialGroup(group)
            )
          const from = findByName(item.from)
          const to = findByName(item.to)
          if (!from || !to || from.id === to.id) {
            failed += 1
            continue
          }
          await storage.group.update({
            id: to.id,
            extensions: [...new Set([...(to.extensions ?? []), ...(from.extensions ?? [])])]
          })
          await storage.group.deleteGroup(from.id)
        } catch {
          failed += 1
        }
      }

      if (failed === 0) {
        messageApi.success(getLang("ai_group_applied"))
      } else {
        messageApi.warning(`${getLang("ai_group_applied_partial")}: ${failed}`)
      }
      await onApplied?.()
      onClose?.()
    } finally {
      setApplying(false)
    }
  }

  const toggleSuggestion = (index, checked) => {
    setSuggestions((prev) => prev.map((item, i) => (i === index ? { ...item, checked } : item)))
  }

  const toggleMerge = (index, checked) => {
    setMerges((prev) => prev.map((item, i) => (i === index ? { ...item, checked } : item)))
  }

  const toggleGroupMerge = (index, checked) => {
    setGroupMerges((prev) => prev.map((item, i) => (i === index ? { ...item, checked } : item)))
  }

  const checkedCount =
    suggestions.filter((item) => item.checked).length +
    merges.filter((item) => item.checked).length +
    groupMerges.filter((item) => item.checked).length

  return (
    <Modal
      title={
        <Space>
          <RobotOutlined />
          {getLang("ai_group_title")}
        </Space>
      }
      open={open}
      onCancel={onClose}
      width={640}
      footer={
        <Space>
          <Button onClick={onClose} disabled={applying}>
            {getLang("ai_cancel")}
          </Button>
          {hasRun && !loading && (
            <Button onClick={runSuggest} disabled={applying}>
              {getLang("ai_regenerate")}
            </Button>
          )}
          {loading ? (
            // 分析中主操作是「停止」：立即中断当前请求，已完成批次的结果保留
            <Button danger onClick={stopAnalyze}>
              {getLang("ai_group_stop")}
            </Button>
          ) : hasRun ? (
            <Button
              type="primary"
              loading={applying}
              disabled={checkedCount === 0}
              onClick={applySuggestions}>
              {`${getLang("ai_group_apply")} (${checkedCount})`}
            </Button>
          ) : (
            <Button type="primary" onClick={runSuggest}>
              {getLang("ai_group_run")}
            </Button>
          )}
        </Space>
      }>
      {contextHolder}
      <Alert
        type="info"
        showIcon
        message={getLang("ai_data_notice")}
        style={{ marginBottom: 16 }}
      />

      <Space wrap style={{ marginBottom: 16 }}>
        <span>{getLang("ai_group_scope_label")}</span>
        <Radio.Group value={scope} onChange={(e) => setScope(e.target.value)} disabled={loading}>
          <Radio.Button value="ungrouped">{getLang("ai_group_scope_ungrouped")}</Radio.Button>
          <Radio.Button value="all">{getLang("ai_group_scope_all")}</Radio.Button>
        </Radio.Group>
        <Checkbox
          checked={includePerms}
          onChange={(e) => setIncludePerms(e.target.checked)}
          disabled={loading}>
          {getLang("ai_group_include_permissions")}
        </Checkbox>
      </Space>

      {/* 预设分组框架：组名固定可编辑，AI 只做分配，不再自由发明组名 */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ color: "#999", fontSize: 12, marginBottom: 4 }}>
          <Space>
            {getLang("ai_group_preset_label")}
            {!loading && !editingPreset && (
              // 原生 title 代替 Tooltip：少一层依赖，悬停仍有提示
              <EditOutlined
                title={getLang("ai_group_preset_edit")}
                style={{ cursor: "pointer" }}
                onClick={() => setEditingPreset(true)}
              />
            )}
          </Space>
        </div>

        {editingPreset ? (
          <div>
            <Space wrap size={4}>
              {presetNames.map((name) =>
                // 正在重命名的组原地变输入框：回车/失焦确认，Esc 取消
                renamingKey === name ? (
                  <Input
                    key={`rename-${name}`}
                    size="small"
                    autoFocus
                    value={renameValue}
                    maxLength={8}
                    style={{ width: 110 }}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onPressEnter={confirmPresetRename}
                    onBlur={confirmPresetRename}
                    onKeyDown={(e) => {
                      if (e.key === "Escape") {
                        setRenamingKey(null)
                      }
                    }}
                  />
                ) : (
                  <Tag
                    key={name}
                    closable
                    onClose={(e) => {
                      // preventDefault 阻止 Tag 关闭动画后再由 state 驱动重渲染；
                      // 可选链兜底不同 antd 版本的事件形态差异
                      e?.preventDefault?.()
                      removePresetName(name)
                    }}>
                    <Space size={4}>
                      <span>{name}</span>
                      <EditOutlined
                        title={getLang("ai_group_preset_rename")}
                        style={{ cursor: "pointer", color: "#999" }}
                        onClick={(e) => {
                          e.stopPropagation()
                          startPresetRename(name)
                        }}
                      />
                    </Space>
                  </Tag>
                )
              )}
            </Space>
            <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
              <Input
                size="small"
                style={{ width: 180 }}
                value={newPresetName}
                placeholder={getLang("ai_group_preset_add_placeholder")}
                maxLength={8}
                onChange={(e) => setNewPresetName(e.target.value)}
                onPressEnter={addPresetName}
              />
              <Button size="small" onClick={addPresetName}>
                {getLang("ai_group_preset_add")}
              </Button>
            </div>
            <div style={{ marginTop: 8 }}>
              <Space>
                <Button size="small" type="primary" onClick={finishPresetEdit}>
                  {getLang("ai_group_preset_done")}
                </Button>
                <Button size="small" onClick={resetPresetNames}>
                  {getLang("ai_group_preset_reset")}
                </Button>
              </Space>
            </div>
          </div>
        ) : (
          <Space wrap size={4}>
            {presetNames.map((name) => (
              <Tag key={name}>{name}</Tag>
            ))}
          </Space>
        )}
      </div>

      {/* 等待期间给出批次进度 + 计时进度条，避免用户以为卡死而提前关窗 */}
      {loading && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ color: "#999", fontSize: 12, marginBottom: 4 }}>
            {batchText || getLang("ai_running_tip")}
          </div>
          <AiProgress loading={loading} expectedMs={progressExpectedMs} />
        </div>
      )}

      <List
        loading={loading}
        dataSource={suggestions}
        locale={{ emptyText: hasRun ? getLang("ai_group_empty") : getLang("ai_group_hint") }}
        renderItem={(item, index) => (
          <List.Item>
            <Checkbox
              checked={item.checked}
              onChange={(e) => toggleSuggestion(index, e.target.checked)}>
              <Space direction="vertical" size={2} style={{ marginLeft: 8 }}>
                <span style={{ fontWeight: 600 }}>{item.name}</span>
                {item.desc && <span style={{ color: "#999", fontSize: 12 }}>{item.desc}</span>}
                <span>
                  {item.extensionIds.map((id) => (
                    <Tag key={id} style={{ marginBottom: 2 }}>
                      {nameById.get(id) ?? id}
                    </Tag>
                  ))}
                </span>
              </Space>
            </Checkbox>
          </List.Item>
        )}
      />

      {/* 与现有分组同名的建议：把这些扩展并入现有组，而不是新建组 */}
      {merges.length > 0 && (
        <List
          header={getLang("ai_group_merge_title")}
          dataSource={merges}
          renderItem={(item, index) => (
            <List.Item>
              <Checkbox
                checked={item.checked}
                onChange={(e) => toggleMerge(index, e.target.checked)}>
                <Space direction="vertical" size={2} style={{ marginLeft: 8 }}>
                  <span style={{ fontWeight: 600 }}>{item.name}</span>
                  <span>
                    {item.extensionIds.map((id) => (
                      <Tag key={id} style={{ marginBottom: 2 }}>
                        {nameById.get(id) ?? id}
                      </Tag>
                    ))}
                  </span>
                </Space>
              </Checkbox>
            </List.Item>
          )}
        />
      )}

      {/* 冗余分组合并建议：from 组并入 to 组后删除 from，用于清理语义重复的组 */}
      {groupMerges.length > 0 && (
        <List
          header={getLang("ai_group_cleanup_title")}
          dataSource={groupMerges}
          renderItem={(item, index) => (
            <List.Item>
              <Checkbox
                checked={item.checked}
                onChange={(e) => toggleGroupMerge(index, e.target.checked)}>
                <span style={{ marginLeft: 8 }}>
                  {getLang("ai_group_cleanup_item", item.from, item.to)}
                </span>
              </Checkbox>
            </List.Item>
          )}
        />
      )}
    </Modal>
  )
}

export default AiGroupSuggestModal
