import React, { memo } from "react"

import { Tooltip } from "antd"
import classNames from "classnames"
import { styled } from "styled-components"

import { getIcon } from ".../utils/extensionHelper"
import { appendAdditionInfo, sortExtension } from ".../utils/extensionHelper"

/**
 * @param items 需要显示的扩展
 * @param placeholder 列表中没有内容时，显示的提示文字
 * @param onClick 点击单个扩展项时的回调
 */
const ExtensionItems = memo(({ items, placeholder, onClick, options, showFixedPin, footer }) => {
  const isEmpty = !items || items.length === 0

  // 附加了额外信息的扩展列表
  const extensions = appendAdditionInfo(items, options?.management)
  const sortedItems = sortExtension(extensions)

  return (
    <Style>
      {isEmpty ? (
        <p className="placeholder">{placeholder}</p>
      ) : (
        <ul>
          {sortedItems.map((item) => {
            // 如果存在别名，则显示别名
            const showName = item.__attach__?.alias ? item.__attach__?.alias : item.name

            return (
              <li
                key={item.id}
                className={classNames({
                  "not-enable": !item.enabled
                })}>
                <Tooltip placement="top" title={item.name}>
                  <div className="ext-item" onClick={(e) => onClick(e, item)}>
                    <div>
                      <img src={getIcon(item, 128)} alt="" />
                      {showFixedPin?.(item) && <i className="ext-item-fixed-dot"></i>}
                    </div>
                    <span>{showName}</span>
                  </div>
                </Tooltip>
                {footer?.(item)}
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

  li {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .ext-item {
    display: flex;
    flex-direction: column;
    align-items: center;

    width: 100px;
    margin: 12px 15px;
    margin-bottom: 20px;

    div {
      position: relative;
    }
  }

  .ext-item-fixed-dot {
    position: absolute;

    top: -3px;
    right: -3px;

    width: 12px;
    height: 12px;
    margin: 0;

    border: 3px solid #888;
    border-radius: 6px;
    box-shadow: 0 0 0px 1px #fff;

    background-color: #3ffa7b;
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
