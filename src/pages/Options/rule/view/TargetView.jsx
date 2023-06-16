import React, { memo } from "react"

import { styled } from "styled-components"

import { getIcon } from ".../utils/extensionHelper"

const TargetView = memo(({ config, record, groupOption, extensions }) => {
  if (!config || !config.targetType) {
    return <p>ERROR</p>
  }

  if (config.targetType === "single") {
    if (!config.targetExtensions || config.targetExtensions.length < 1) {
      return <p>ERROR</p>
    }

    let list = extensions.filter((ext) =>
      config.targetExtensions.includes(ext.id)
    )

    let tooMany = false
    if (list.length > 12) {
      list = list.slice(0, 12)
      tooMany = true
    }

    return (
      <ListStyle>
        {list.map((ext) => {
          return (
            <li key={ext.id}>
              <img src={getIcon(ext, 64)} alt="" />
            </li>
          )
        })}
        {tooMany && <span className="too-many">...</span>}
      </ListStyle>
    )
  }

  if (config.targetType === "group") {
    if (!config.targetGroup) {
      return <p>ERROR</p>
    }
    const group = groupOption.filter((g) => g.id === config.targetGroup)[0]
    if (!group) {
      return <p>ERROR</p>
    }

    return <h3>{group.name}</h3>
  }

  return <div>TargetView</div>
})

export default TargetView

const ListStyle = styled.ul`
  display: flex;
  align-items: center;

  margin: 0;

  img {
    display: block;
    width: 24px;
    height: 24px;
    margin-right: 4px;
  }

  .too-many {
    font-size: 16px;
    font-weight: 900;
  }
`
