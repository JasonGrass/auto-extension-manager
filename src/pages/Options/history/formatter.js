import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"

import { getLang } from ".../utils/utils"

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
      return getLang("history_install")
    case "uninstall":
      return getLang("history_uninstall")
    case "updated":
      return getLang("history_update")
    case "enabled":
      return getLang("history_enable")
    case "disabled":
      return getLang("history_disable")
    case "browser_updated":
      return getLang("history_browser_update")
    default:
      return "UNKNOWN"
  }
}
