import React, { memo, useMemo } from "react"

import { storage } from ".../storage/sync"
import SingleGroupDropdown from "./SingleGroupDropdown"

const GroupDropdown = memo(
  ({ options, extensions, enabledById, className, onGroupChanged, onGroupEnableChanged }) => {
    const groupItems = useMemo(() => storage.helper.formatGroups(options.groups), [options.groups])

    return (
      <div className={className}>
        <SingleGroupDropdown
          options={options}
          extensions={extensions}
          enabledById={enabledById}
          groups={groupItems}
          onGroupChanged={onGroupChanged}
          onGroupEnableChanged={onGroupEnableChanged}></SingleGroupDropdown>
      </div>
    )
  }
)

export default GroupDropdown
