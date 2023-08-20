import defaultPuzzleIcon from "../assets/img/puzzle.svg"

export const getIcon = function (extension, size = 16) {
  const { icons } = extension

  // Get retina size if necessary
  size *= window.devicePixelRatio

  if (icons) {
    // Get a large icon closest to the desired size
    for (const icon of icons.reverse()) {
      if (icon.size >= size) {
        return icon.url
      }
    }
  }

  if (icons) {
    return icons.reverse()[0]?.url ?? defaultPuzzleIcon
  }

  return defaultPuzzleIcon
}

export const isAppExtension = function (ext) {
  const appTypes = ["hosted_app", "packaged_app", "legacy_packaged_app"]
  return appTypes.includes(ext.type)
}

export const isExtExtension = function (ext) {
  const extTypes = ["extension"]
  return extTypes.includes(ext.type)
}

export const filterExtensions = (extensions, filter) => {
  if (!extensions) {
    return []
  }
  return extensions.filter(filter)
}

export const sortExtension = (extensions) => {
  if (!extensions) {
    return []
  }

  const list = []
  // distinct
  extensions.forEach((ext) => {
    if (list.find((i) => i.id === ext.id)) {
      return
    }
    list.push(ext)
  })

  return list.sort((a, b) => {
    if (a.enabled === b.enabled) {
      const aName = a.__attach__?.alias ? a.__attach__?.alias : a.name
      const bName = b.__attach__?.alias ? b.__attach__?.alias : b.name
      return aName.localeCompare(bName) // Sort by name
    }
    return a.enabled < b.enabled ? 1 : -1 // Sort by state
  })
}

/**
 * 根据额外的配置数据，给插件添加附加的一些数据，如别名，备注等
 */
export const appendAdditionInfo = (extensions, managementOptions) => {
  if (!extensions) {
    return []
  }
  if (!managementOptions || !managementOptions.extensions) {
    return extensions
  }

  for (const extension of extensions) {
    const addition = managementOptions.extensions.find((ext) => ext.extId === extension.id)
    if (!addition) {
      extension.__attach__ = {}
      continue
    }
    extension.__attach__ = addition
  }

  return extensions
}
