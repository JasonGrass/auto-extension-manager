import localforage from "localforage"

import { isEdgePackage } from ".../utils/channelHelper"

export const checkLatestVersion = async () => {
  try {
    await check()
  } catch (error) {
    console.error("checkLatestVersion", error)
  }
}

const check = async () => {
  const forage = localforage.createInstance({
    driver: localforage.LOCALSTORAGE,
    name: "ExtensionManager",
    version: 1.0,
    storeName: "localCache"
  })

  const time = await forage.getItem("latest_version_check_time")
  if (time && Date.now() - time < 24 * 60 * 60 * 1000) {
    return
  }

  const apiUrl = "https://api.github.com/repos/JasonGrass/auto-extension-manager/releases/latest"
  const response = await fetch(apiUrl)
  const json = await response.json()
  const latestVersion = json.tag_name
  const latestVersionPublishTime = json.published_at

  if (!latestVersion) {
    return
  }

  const version = latestVersion.slice(1)

  console.log("latest version", version, latestVersionPublishTime)
  forage.setItem("latest_version", version)
  forage.setItem("latest_version_publish_time", latestVersionPublishTime)
  forage.setItem("latest_version_check_time", Date.now())
}

export const compareVersion = async (currentVersion) => {
  const forage = localforage.createInstance({
    driver: localforage.LOCALSTORAGE,
    name: "ExtensionManager",
    version: 1.0,
    storeName: "localCache"
  })

  const latestVersion = await forage.getItem("latest_version")

  if (!latestVersion) {
    return null
  }

  if (currentVersion === latestVersion) {
    return null
  }

  const parse = (version) => {
    const arr = version.trim().split(".")
    return arr.map(Number)
  }

  let current = parse(currentVersion)
  let latest = parse(latestVersion)

  if (current.length !== 3 || latest.length !== 3) {
    return null
  }

  current = Number(current.map((v) => v.toString().padStart(4, "0")).join(""))
  latest = Number(latest.map((v) => v.toString().padStart(4, "0")).join(""))

  if (current > latest) {
    // 理论上不可能
    console.warn("当前版本大于最新的版本", current, "  ", latest)
    return null
  }

  if (latest - current <= 3) {
    return null // 相差较小，不必提示升级
  }

  const latestVersionPublishTime = await forage.getItem("latest_version_publish_time")
  if (!latestVersionPublishTime) {
    return null
  }
  const publishTime = new Date(latestVersionPublishTime)

  const days = isEdgePackage() ? 30 : 15

  // 如果是 edge 的安装包，则这里检查时间为 30 天
  if (Date.now() - publishTime < days * 24 * 60 * 60 * 1000) {
    return null // 时间较短，不必提示升级
  }

  // 提示升级
  return {
    latestVersion,
    needUpdate: true
  }
}
