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

export const isDevRuntime = () => {
  const development = "development"
  const production = "production"
  try {
    // 编译时会被替换
    const env = RUNTIME_ENV
    if (env === "development") {
      return true
    } else {
      return false
    }
  } catch (err) {
    return false
  }
}
