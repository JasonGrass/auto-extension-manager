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

    const list = extensions.filter((ext) =>
      config.targetExtensions.includes(ext.id)
    )

    return (
      <ListStyle>
        {list.map((ext) => {
          return (
            <li key={ext.id}>
              <img src={getIcon(ext, 64)} alt="" />
            </li>
          )
        })}
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

  img {
    width: 36px;
    height: 36px;
    margin-right: 4px;
  }
`
