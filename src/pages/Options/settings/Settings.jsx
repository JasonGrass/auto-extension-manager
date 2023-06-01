import React, { useEffect, useState } from "react"

import optionsStorage from ".../storage/index"
import Title from "../Title.jsx"
import { SettingStyle } from "./SettingStyle"

function Settings() {
  const [popupWidth, setPopupWidth] = useState("")

  useEffect(() => {
    async function initOptions() {
      const options = await optionsStorage.getAll()
      setPopupWidth(options.popupWidth)
    }
    // 仅在首次加载时初始化
    if (popupWidth === "") {
      initOptions()
    }
  })

  const onPopupWidthChanged = (e) => {
    const width = Number(e.target.value)
    if (Number.isNaN(width) || width < 0) {
      return
    }
    setPopupWidth(width)

    if (width >= 200 && width <= 1000) {
      optionsStorage.set({ popupWidth: width })
    }
  }

  return (
    <SettingStyle>
      <Title title="通用设置"></Title>

      <form>
        <label>
          弹窗宽度([200,1000])：
          <input
            id="popupWidth"
            type="text"
            value={popupWidth}
            onChange={(e) => onPopupWidthChanged(e)}
          />
        </label>
      </form>
    </SettingStyle>
  )
}

export default Settings
