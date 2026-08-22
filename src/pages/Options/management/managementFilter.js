export const ALL_GROUPS_FILTER = "__all_groups__"

/**
 * Build labels with existing locale keys as fallbacks. Chrome can temporarily return an empty
 * string for newly added messages until the extension is reloaded.
 */
export function buildGroupFilterOptions(groups, getMessage) {
  const message = (key, fallbackKey) => getMessage(key) || getMessage(fallbackKey)

  return [
    {
      value: ALL_GROUPS_FILTER,
      label: message("management_all_groups", "group_select_all")
    },
    ...(groups ?? []).map((group) => ({
      value: group.id,
      label:
        group.id === "fixed"
          ? getMessage("group_fixed_name")
          : group.id === "hidden"
            ? getMessage("group_hidden_name")
            : group.name
    }))
  ]
}

/**
 * Filter management records by the extension IDs stored in a group.
 */
export function filterRecordsByGroup(records, groupId, groups) {
  if (groupId === ALL_GROUPS_FILTER) {
    return records
  }

  const group = groups?.find((item) => item.id === groupId)
  if (!group) {
    return []
  }

  const extensionIds = new Set(group.extensions ?? [])
  return records.filter((record) => extensionIds.has(record.id))
}
