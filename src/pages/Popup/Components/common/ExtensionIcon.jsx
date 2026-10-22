import React, { createContext, memo, useContext } from "react"

import { getIcon } from ".../utils/extensionHelper"

// Icon completion is presentation-only: keep it outside sorting/search dependencies.
export const PopupIconContext = createContext(new Map())

const ExtensionIcon = memo(({ item, size = 128, ...props }) => {
  const icons = useContext(PopupIconContext)
  const cached = icons.get(item.id)
  const displayItem =
    cached?.icon && cached.version === item.version ? { ...item, icon: cached.icon } : item
  return <img {...props} src={getIcon(displayItem, size)} />
})

export default ExtensionIcon
