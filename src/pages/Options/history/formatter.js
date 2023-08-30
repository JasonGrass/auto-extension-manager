import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"

dayjs.extend(relativeTime)

export const formatTimeAbsolute = (timestamp) => {
  return dayjs(timestamp).format("YY-MM-DD HH:mm:ss")
}

export const formatTimeRelative = (timestamp) => {
  return dayjs(timestamp).fromNow()
}

export const formatEventText = (event) => {
  switch (event) {
    case "install":
      return "安装"
    case "uninstall":
      return "卸载"
    case "updated":
      return "更新"
    case "enabled":
      return "启用"
    case "disabled":
      return "禁用"
    case "browser_updated":
      return "浏览器更新"
    default:
      return "UNKNOWN"
  }
}
