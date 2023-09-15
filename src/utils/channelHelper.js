import { getPackageChannel } from "./generate/builderEnv"

/*
 * 判断运行环境是否为 Edge 浏览器，仅限在有 BOM 的页面使用
 */
export const isEdgeRuntime = () => {
  try {
    if (window.navigator.userAgent.includes("Edg/")) {
      return true
    } else {
      return false
    }
  } catch (error) {
    console.error("isEdgeRuntime", error)
    return false
  }
}

/**
 * 判断是否为 Edge 商店上架的安装包
 */
export const isEdgePackage = () => {
  const packageChannel = getPackageChannel()
  if (packageChannel === "edge") {
    return true
  } else {
    return false
  }
}
