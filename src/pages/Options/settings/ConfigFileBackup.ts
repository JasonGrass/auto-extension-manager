import storage from ".../storage/sync"
import { LocalOptions } from ".../storage/local"
import { GroupSnapshotStorage } from ".../storage/local/GroupSnapshotStorage"
import { downloadFile, formatDate } from ".../utils/utils"
import ConvertRuleToV2 from "../../Background/rule/RuleConverter"

const localOptions = new LocalOptions()
const snapshotStorage = new GroupSnapshotStorage()

/**
 * 导出配置。
 * 除 sync 里的常规配置外，还包含三项本地数据（旧版扩展导入时自动忽略）：
 * - aiConfig：AI 设置（含 API Key 明文，导出文件需妥善保管）
 * - presetGroupNames：AI 分组的预设分组名单
 * - groupSnapshots：全部分组快照
 */
export async function exportConfig() {
  const config = await storage.options.getAll()

  // 本地数据：AI 设置（含 Key 明文）、预设分组名单、全部分组快照。
  // 字段缺失时省略键，旧版扩展导入这种文件也能正常工作
  const [aiConfig, presetGroupNames, groupSnapshots] = await Promise.all([
    localOptions.getLlmConfig(),
    localOptions.getValue("presetGroupNames"),
    snapshotStorage.list()
  ])

  const data = {
    setting: config.setting,
    groups: config.groups,
    scenes: config.scenes,
    ruleConfig: config.ruleConfig,
    management: config.management,
    ...(aiConfig ? { aiConfig } : {}),
    ...(Array.isArray(presetGroupNames) && presetGroupNames.length > 0 ? { presetGroupNames } : {}),
    ...(groupSnapshots.length > 0 ? { groupSnapshots } : {})
  }

  exportToJsonFile(data, `ext_manager_config_${formatDate(new Date())}.json`)
}

/**
 * 导入配置
 */
export async function importConfig(): Promise<boolean> {
  try {
    const data = await importFromJsonFile()
    const config = await storage.options.getAll()

    if (mergeConfig(data as ImportData, config as any as ImportData)) {
      await storage.options.setAll(config)
      await importLocalData(data as ImportData)
      return true
    }
    return false
  } catch (error) {
    console.error(error)
    return false
  }
}

/**
 * 恢复 AI 相关的本地数据（旧版导出文件没有这些字段时自动跳过）。
 * 快照按 key 去重合并：本机已有的 key（同一时间生成的快照）跳过，其余追加
 */
async function importLocalData(data: Partial<ImportData>) {
  const aiConfig = (data as any).aiConfig
  if (aiConfig?.baseURL && aiConfig?.apiKey && aiConfig?.model) {
    await localOptions.setLlmConfig(aiConfig)
  }

  const presetGroupNames = (data as any).presetGroupNames
  if (Array.isArray(presetGroupNames) && presetGroupNames.length > 0) {
    await localOptions.setValue("presetGroupNames", presetGroupNames)
  }

  const groupSnapshots = (data as any).groupSnapshots
  if (Array.isArray(groupSnapshots)) {
    const existingKeys = new Set((await snapshotStorage.list()).map((item) => item.key))
    for (const snapshot of groupSnapshots) {
      if (
        snapshot &&
        typeof snapshot.key === "string" &&
        !existingKeys.has(snapshot.key) &&
        Array.isArray(snapshot.groups)
      ) {
        await snapshotStorage.saveImported(snapshot)
      }
    }
  }
}

type ImportData = {
  setting: config.ISetting
  groups: config.IGroup[]
  scenes: config.IScene[]
  ruleConfig: ruleV2.IRuleConfig[]
  management: config.IManagement
}

function mergeConfig(importData: ImportData, config: ImportData): boolean {
  if (!importData || !config) {
    return false
  }

  if (importData.setting) {
    const setting = { ...config.setting, ...importData.setting }
    config.setting = setting
  }

  if (importData.groups) {
    const newGroups = importData.groups.filter(
      (g) => config.groups.findIndex((g2) => g2.id === g.id) < 0
    )
    config.groups.push(...newGroups)
  }

  if (importData.scenes) {
    const newScenes = importData.scenes.filter(
      (s) => config.scenes.findIndex((s2) => s2.id === s.id) < 0
    )
    config.scenes.push(...newScenes)
  }

  if (importData.ruleConfig) {
    const newConfigs = importData.ruleConfig.filter(
      (r) => config.ruleConfig.findIndex((r2) => r2.id === r.id) < 0
    )

    const configV2 = newConfigs.map((c) => ConvertRuleToV2(c as any)).filter((c) => c)
    config.ruleConfig.push(...(configV2 as any))
  }

  if (importData.management) {
    let extensionAttachInfos: config.IExtensionAttachInfo[] = []
    if (importData.management.extensions) {
      const remain = config.management.extensions.filter(
        (e) => importData.management.extensions.findIndex((e2) => e2.extId === e.extId) < 0
      )
      extensionAttachInfos = [...remain, ...importData.management.extensions]
    }
    config.management.extensions = extensionAttachInfos
  }

  return true
}

async function importFromJsonFile() {
  const inputElement = document.createElement("input")
  inputElement.setAttribute("type", "file")
  inputElement.setAttribute("accept", ".json")
  inputElement.click()

  return await new Promise((resolve, reject) => {
    inputElement.onchange = (event: any) => {
      const selectedFile = event.target?.files[0]
      if (selectedFile) {
        readJsonFile(selectedFile).then((data) => {
          resolve(data)
        })
      }
    }
  })
}

async function readJsonFile(file: Blob) {
  const reader = new FileReader()

  const waiter = new Promise((resolve, reject) => {
    reader.onload = function (event: any) {
      const jsonText = event.target.result
      const jsonData = JSON.parse(jsonText)
      resolve(jsonData)
    }
  })

  reader.readAsText(file)
  return await waiter
}

function exportToJsonFile(data: any, filename: string) {
  const jsonStr = JSON.stringify(data, null, 2)
  const blob = new Blob([jsonStr], { type: "application/json" })

  downloadFile(blob, filename)
}
