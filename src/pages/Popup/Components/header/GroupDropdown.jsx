import React, { memo } from "react"

import { storage } from ".../storage/sync"
import MultiGroupDropdown from "./MultiGroupDropdown"
import SingleGroupDropdown from "./SingleGroupDropdown"

const GroupDropdown = memo(({ options, className, onGroupChanged }) => {
  const groupItems = storage.helper.formatGroups(options.groups)

  // 是否允许分组多选
  const raiseEnable = options.setting.isRaiseEnableWhenSwitchGroup
  const supportMultiSelect = options.setting.isSupportMultiSelectGroup ?? false
  const isMultiSelect = raiseEnable && supportMultiSelect

  return (
    <div className={className}>
      {isMultiSelect ? (
        <MultiGroupDropdown
          options={options}
          items={groupItems}
          onGroupChanged={onGroupChanged}></MultiGroupDropdown>
      ) : (
        <SingleGroupDropdown
          options={options}
          groups={groupItems}
          onGroupChanged={onGroupChanged}></SingleGroupDropdown>
      )}
    </div>
  )
})

export default GroupDropdown
