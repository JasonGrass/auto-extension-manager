import React, { memo } from "react"

import { styled } from "styled-components"

import { usePopupExtensions } from "../../utils/usePopupExtensions"
import ExtensionGridItem from "./ExtensionGridItem"

const ExtensionGrid = memo(({ extensions, options, isShowBottomDivider }) => {
  const [items0, items1, items2] = usePopupExtensions(extensions, options)

  // 置顶分区下方的分割线是否显示
  const dividerShow0 = items0.length > 0 && (items1.length > 0 || items2.length > 0)

  return (
    <Style>
      <ul>
        {items0.map((item) => {
          return (
            <li key={item.id}>
              <ExtensionGridItem item={item} options={options}></ExtensionGridItem>
            </li>
          )
        })}
        {new Array(10).fill("").map((_, index) => (
          <i key={index}></i>
        ))}
      </ul>
      {dividerShow0 && <div className="divider"></div>}
      <ul>
        {items1.map((item) => {
          return (
            <li key={item.id}>
              <ExtensionGridItem item={item} options={options}></ExtensionGridItem>
            </li>
          )
        })}
        {new Array(10).fill("").map((_, index) => (
          <i key={index}></i>
        ))}
      </ul>
      {items1.length > 0 && items2.length > 0 && <div className="divider"></div>}
      <ul>
        {items2.map((item) => {
          return (
            <li key={item.id}>
              <ExtensionGridItem item={item} options={options}></ExtensionGridItem>
            </li>
          )
        })}
        {new Array(10).fill("").map((_, index) => (
          <i key={index}></i>
        ))}
      </ul>
      {isShowBottomDivider && <div className="divider"></div>}
    </Style>
  )
})

export default ExtensionGrid

const imgSize = "46px"
const imgMargin = "16px"

const Style = styled.div`
  ul {
    display: flex;
    justify-content: space-between;
    align-content: flex-start;
    flex-wrap: wrap;

    li {
      width: ${imgSize};
      margin: 16px ${imgMargin};
    }

    i {
      width: ${imgSize};
      margin: 0px ${imgMargin};
    }
  }

  .divider {
    height: 1px;
    background-color: ${(props) => props.theme.input_border};
    margin: 0px 10px 0px 10px;
  }
`
