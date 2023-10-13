import React, { forwardRef, memo, useImperativeHandle, useRef } from "react"

import ExtensionTarget from ".../pages/Options/components/ExtensionTarget"
import { getLang } from ".../utils/utils"

const ExtensionSelector = ({ options, config, extensions }, ref) => {
  const emptyMessage = getLang("rule_set_target_no_any_target")

  const selectorRef = useRef(null)

  useImperativeHandle(ref, () => ({
    // 获取配置
    getExtensionSelectConfig: () => {
      return selectorRef.current.getExtensionSelectConfig()
    }
  }))

  return (
    <ExtensionTarget
      options={options}
      config={config}
      extensions={extensions}
      params={{ emptyMessage }}
      ref={selectorRef}></ExtensionTarget>
  )
}

export default memo(forwardRef(ExtensionSelector))
