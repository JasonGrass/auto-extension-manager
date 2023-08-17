import React, { memo } from "react"

import { styled } from "styled-components"

import { getIcon } from ".../utils/extensionHelper"

/**
 * 规则目标的显示
 * @param config 规则中目标的那部分配置（ITarget）
 * @param options 完整的配置
 */
const TargetView = memo(({ config, options, extensions }) => {
  console.log("TargetView", config)

  if (!config || (!config.extensions && !config.groups)) {
    return <span className="error-text">ERROR</span>
  }

  let groupNames = ""
  if (config.groups && config.groups.length > 0) {
    groupNames = options.groups
      .filter((g) => config.groups.includes(g.id))
      .map((g) => g.name)
      .join(",")
  }

  if (config.extensions && config.extensions.length > 0) {
    let list = extensions.filter((ext) => config.extensions.includes(ext.id))

    let tooMany = false
    if (list.length > 12) {
      list = list.slice(0, 12)
      tooMany = true
    }

    // groups 和 extensions 都有
    return (
      <span>
        {groupNames && <span>{groupNames}</span>}
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
      </span>
    )
  } else if (groupNames) {
    // 仅有 groups
    return <span>{groupNames}</span>
  }

  return <span className="error-text">ERROR</span>
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
