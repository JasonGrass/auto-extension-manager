import React, { memo, useEffect, useRef, useState } from "react"

import SceneOptions from ".../storage/SceneOptions"
import ExtensionSelector from "./editor/ExtensionSelector"
import MatchRule from "./editor/MatchRule"
import RuleAction from "./editor/RuleAction"

const EditRule = memo(() => {
  const [allSceneOptions, setAllSceneOptions] = useState([])

  const matchRuleRef = useRef(null)
  const extensionSelectorRef = useRef(null)

  useEffect(() => {
    SceneOptions.getAll().then((list) => {
      setAllSceneOptions(list)
    })
  }, [])

  return (
    <div>
      <MatchRule sceneList={allSceneOptions} ref={matchRuleRef}></MatchRule>
      <ExtensionSelector></ExtensionSelector>
      <RuleAction></RuleAction>
    </div>
  )
})

export default EditRule
