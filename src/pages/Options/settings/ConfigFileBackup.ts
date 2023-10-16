import storage from ".../storage/sync"
import { downloadFile, formatDate } from ".../utils/utils"
import ConvertRuleToV2 from "../../Background/rule/RuleConverter"

/**
 * 导出配置
 */
export async function exportConfig() {
  const config = await storage.options.getAll()
  const data = {
    setting: config.setting,
    groups: config.groups,
    scenes: config.scenes,
    ruleConfig: config.ruleConfig,
    management: config.management
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
      return true
    }
    return false
  } catch (error) {
    console.error(error)
    return false
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
