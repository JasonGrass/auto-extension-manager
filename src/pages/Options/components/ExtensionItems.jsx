import React, { memo } from "react"

import { Tooltip } from "antd"
import classNames from "classnames"
import { styled } from "styled-components"

import { getIcon } from ".../utils/extensionHelper"

/**
 * @param items 需要显示的扩展
 * @param placeholder 列表中没有内容时，显示的提示文字
 * @param onClick 点击单个扩展项时的回调
 */
const ExtensionItems = memo(({ items, placeholder, onClick, managementOptions }) => {
  const isEmpty = items && items.length === 0

  return (
    <Style>
      {isEmpty ? (
        <p className="placeholder">{placeholder}</p>
      ) : (
        <ul>
          {items.map((item) => {
            // 如果存在别名，则显示别名
            const addition = managementOptions?.extensions?.filter(
              (ext) => ext.extId === item.id
            )[0]
            const showName = addition?.alias ? addition.alias : item.name

            return (
              <li
                key={item.id}
                className={classNames({
                  "not-enable": !item.enabled
                })}
                onClick={(e) => onClick(e, item)}>
                <Tooltip placement="top" title={item.name}>
                  <div className="ext-item">
                    <img src={getIcon(item, 128)} alt="" />
                    <span>{showName}</span>
                  </div>
                </Tooltip>
              </li>
            )
          })}
        </ul>
      )}
    </Style>
  )
})

export default ExtensionItems

const Style = styled.div`
  ul {
    display: flex;
    flex-wrap: wrap;
  }

  .ext-item {
    display: flex;
    flex-direction: column;
    align-items: center;

    width: 100px;
    margin: 12px 15px;
    margin-bottom: 20px;
  }

  .ext-item img {
    width: 32px;
    height: 32px;
  }

  .ext-item span {
    width: 100%;

    margin-top: 5px;

    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-align: center;
  }

  .not-enable {
    color: #cccccc;
  }

  .placeholder {
    margin-top: 20px;
    margin-bottom: 20px;
    padding-left: 5px;

    color: #888;
    font-size: 14px;
    line-height: 20px;

    border-left: 2px solid #cccccc;
  }
`
