import React, { useEffect, useState } from "react"

import OptionsStorage from ".../storage/index"
import Title from "../Title.jsx"
import { SettingStyle } from "./SettingStyle"

function Settings() {
  const [popupWidth, setPopupWidth] = useState("")

  useEffect(() => {
    OptionsStorage.getAll().then((options) => {
      setPopupWidth(options.popupWidth)
    })
  }, [])

  const onPopupWidthChanged = (e) => {
    const width = Number(e.target.value)
    if (Number.isNaN(width) || width < 0) {
      return
    }
    setPopupWidth(width)
    if (width >= 200 && width <= 1000) {
      OptionsStorage.set({ popupWidth: width })
    }
  }

  return (
    <SettingStyle>
      <Title title="通用设置"></Title>

      {/*
      popup 界面设置
      1 显示 APP?
      2 显示情景模式切换?
      3 显示分组切换?
      4 显示搜索按钮?
      5 显示整个 header?
      */}

      {/* <form>
        <label>
          弹窗宽度([200,1000])：
          <input
            id="popupWidth"
            type="text"
            value={popupWidth}
            onChange={(e) => onPopupWidthChanged(e)}
          />
        </label>
      </form> */}
    </SettingStyle>
  )
}

export default Settings
