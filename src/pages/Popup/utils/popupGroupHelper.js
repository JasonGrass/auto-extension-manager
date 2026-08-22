export const NO_GROUP_ID = "__no_group__"

export function buildNoGroup(extensions = [], groups = [], name = "") {
  const groupedExtensionIds = new Set(groups.flatMap((group) => group.extensions ?? []))

  return {
    id: NO_GROUP_ID,
    name,
    extensions: extensions
      .filter((extension) => !groupedExtensionIds.has(extension.id))
      .map((extension) => extension.id)
  }
}
