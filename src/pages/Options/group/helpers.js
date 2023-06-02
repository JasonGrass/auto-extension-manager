export const AddNewNavItem = {
  name: "新建分组",
  id: "__add__"
}

/**
 * 检查当前分组是否为指定分组；
 * @param id 需要检查的分组 id，为空则表示检查普通分组（不是特殊的功能分组，如新建）
 * @returns true: 当前分组与参数匹配; false: 当前分组与参数不匹配
 */
export function checkSelectedGroup(selected, id) {
  if (!selected) {
    return false
  }

  if (!id && selected.id !== "__add__") {
    return true
  }

  return selected.id === id
}
