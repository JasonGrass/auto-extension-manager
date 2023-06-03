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
