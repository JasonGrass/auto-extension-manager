import { OptionsStorage } from ".../storage"

export async function exportConfig() {
  const config = await OptionsStorage.getAll()
  const data = {
    groups: config.groups,
    scenes: config.scenes,
    ruleConfig: config.ruleConfig
  }
  exportToJsonFile(
    data,
    `ext_manager_config_${new Date().toLocaleString()}.json`
  )
}

export async function importConfig(): Promise<boolean> {
  try {
    const data = await importFromJsonFile()
    const config = await OptionsStorage.getAll()

    if (mergeConfig(data as ImportData, config as any as ImportData)) {
      await OptionsStorage.setAll(config)
      return true
    }
    return false
  } catch (error) {
    console.error(error)
    return false
  }
}

type ImportData = {
  groups: config.IGroup[],
  scenes: config.IScene[],
  ruleConfig: rule.IRuleConfig[]
}

function mergeConfig(importData: ImportData, config: ImportData): boolean {

  if (!importData || !config) {
    return false
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
    config.ruleConfig.push(...newConfigs)
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

  const downloadLink = document.createElement("a")
  downloadLink.href = URL.createObjectURL(blob)
  downloadLink.download = filename

  document.body.appendChild(downloadLink)
  downloadLink.click()

  document.body.removeChild(downloadLink)
  URL.revokeObjectURL(downloadLink.href)
}
